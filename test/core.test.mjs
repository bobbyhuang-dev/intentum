import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, realpath, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { requireRuntime, packageName, isManagedRuntime } from '../src/config.mjs';
import { piEnvironment } from '../src/pi.mjs';
import { newerStable } from '../src/version.mjs';
import { installRelease, currentPackage, withInstallLock, writeJson } from '../src/install.mjs';
import { update } from '../src/update.mjs';
import { updatesPiItself, automaticUpdatesAllowed } from '../src/args.mjs';

async function workspace(t) {
  const root = await mkdtemp(join(tmpdir(), 'intentum-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return { home: join(root, 'install'), bin: join(root, 'bin'), agent: join(root, 'agent') };
}

function fakeNpm(version, { broken = false, installError = false } = {}) {
  return async (command, args) => {
    if (command === 'npm' && args[0] === '--version') return '11.0.0';
    if (command === 'npm') {
      if (installError) throw new Error('network unavailable');
      const root = join(args[args.indexOf('--prefix') + 1], 'node_modules', packageName);
      await mkdir(root, { recursive: true });
      await writeJson(join(root, 'package.json'), { name: packageName, version });
      return '';
    }
    if (args.includes('--intentum-check-runtime') && broken) throw new Error('broken runtime');
    return version;
  };
}

test('runtime prerequisites and stable-only upgrades', () => {
  assert.throws(() => requireRuntime('22.18.0', 'linux'), /Node.js/);
  assert.throws(() => requireRuntime('24.1.0', 'win32'), /WSL/);
  requireRuntime('22.19.0', 'linux');
  assert.equal(newerStable('0.1.0', '0.1.0-dev.0'), true);
  assert.equal(newerStable('0.10.0', '0.9.0'), true);
  for (const candidate of ['0.1.0-beta', '0.0.9', '0.1.0', 'https://bad']) assert.equal(newerStable(candidate, '0.1.0'), false);
});

test('runtime environment isolates user data and preserves provider variables', () => {
  const env = piEnvironment({ PI_CODING_AGENT_DIR: '/pi', PI_PACKAGE_DIR: '/other', PI_CODING_AGENT_SESSION_DIR: '/sessions', OPENAI_API_KEY: 'test' }, '/intentum');
  assert.equal(env.PI_CODING_AGENT_DIR, '/intentum');
  assert.equal(env.OPENAI_API_KEY, 'test');
  assert.equal(env.PI_PACKAGE_DIR, undefined);
  assert.equal(env.PI_CODING_AGENT_SESSION_DIR, undefined);
});

test('a checkout does not become managed just because a separate install exists', async (t) => {
  const config = await workspace(t);
  await installRelease({ ...config, run: fakeNpm('0.1.0') });
  assert.equal(await isManagedRuntime(config.home), false);
  assert.equal(await isManagedRuntime(config.home, join(config.home, 'current/node_modules', packageName)), true);
});

test('Pi self-update paths are blocked while extension and model updates remain usable', () => {
  for (const args of [[], ['--force'], ['--all'], ['self'], ['--self'], ['pi']]) assert.equal(updatesPiItself(['update', ...args]), true);
  for (const args of [['--models'], ['--extensions'], ['npm:example'], ['--help']]) assert.equal(updatesPiItself(['update', ...args]), false);
  for (const args of [['-p'], ['--mode', 'rpc'], ['--mode=rpc'], ['--offline'], ['--help'], ['auth']]) assert.equal(automaticUpdatesAllowed(args, { tty: true, env: {} }), false);
  assert.equal(automaticUpdatesAllowed([], { tty: true, env: {} }), true);
  assert.equal(automaticUpdatesAllowed([], { tty: false, env: {} }), false);
  assert.equal(automaticUpdatesAllowed([], { tty: true, env: { INTENTUM_NO_UPDATE: '1' } }), false);
});

test('upgrade preserves settings and old releases; failed installs leave current intact', async (t) => {
  const config = await workspace(t);
  await mkdir(config.agent);
  await writeFile(join(config.agent, 'settings.json'), '{"theme":"custom"}');
  await installRelease({ ...config, run: fakeNpm('0.1.0') });
  const old = await realpath(join(config.home, 'current'));
  await installRelease({ ...config, run: fakeNpm('0.2.0') });
  assert.equal((await currentPackage(config.home)).version, '0.2.0');
  assert.equal(await readFile(join(config.agent, 'settings.json'), 'utf8'), '{"theme":"custom"}');
  assert.equal(JSON.parse(await readFile(join(old, 'node_modules', packageName, 'package.json'))).version, '0.1.0');
  const current = await realpath(join(config.home, 'current'));
  for (const failure of [{ broken: true }, { installError: true }]) {
    await assert.rejects(installRelease({ ...config, run: fakeNpm('0.3.0', failure) }));
    assert.equal(await realpath(join(config.home, 'current')), current);
  }
  assert.equal((await readdir(join(config.home, 'releases'))).length, 2);
  await installRelease({ ...config, expectedVersion: '0.1.0', onlyIfNewer: true, run: () => assert.fail('must not downgrade') });
});

test('installer rejects identity mismatch, concurrent install, and unrelated executable', async (t) => {
  const config = await workspace(t);
  await assert.rejects(installRelease({ ...config, expectedVersion: '0.2.0', run: fakeNpm('0.1.0') }), /identity or version/);
  await withInstallLock(config.home, async () => {
    await assert.rejects(installRelease({ ...config, run: fakeNpm('0.1.0') }), /Another installation/);
  });
  await writeFile(join(config.bin, 'intentum'), 'my executable');
  await assert.rejects(installRelease({ ...config, run: fakeNpm('0.1.0') }), /already exists/);
  assert.equal(await readFile(join(config.bin, 'intentum'), 'utf8'), 'my executable');
});

test('automatic update installs exact newer release, throttles, and honors opt-out', async (t) => {
  const config = await workspace(t);
  await installRelease({ ...config, run: fakeNpm('0.1.0') });
  let installs = 0;
  const options = { ...config, automatic: true, now: 100000000, log: () => {}, run: async () => '"0.2.0"', install: async (options) => {
    installs++;
    assert.equal(options.spec, `${packageName}@0.2.0`);
    assert.equal(options.onlyIfNewer, true);
    return '0.2.0';
  } };
  await update(options);
  await update(options);
  assert.equal(installs, 1);
  await writeJson(join(config.home, 'updates.json'), { enabled: false });
  await update(options);
  assert.equal(installs, 1);
  await update({ ...options, automatic: false });
  assert.equal(installs, 2);
});

test('failed update leaves installed release usable and records the check', async (t) => {
  const config = await workspace(t);
  await installRelease({ ...config, run: fakeNpm('0.1.0') });
  await assert.rejects(update({ ...config, now: 100000000, log: () => {}, run: async () => { throw new Error('offline'); } }), /offline/);
  assert.equal((await currentPackage(config.home)).version, '0.1.0');
  assert.equal(JSON.parse(await readFile(join(config.home, 'updates.json'))).lastCheck, 100000000);
});
