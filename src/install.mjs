import { mkdir, mkdtemp, open, readFile, writeFile, rename, rm, symlink, lstat, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { packageName, requireRuntime } from './config.mjs';
import { capture } from './process.mjs';
import { newerStable } from './version.mjs';

export const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

export async function readJson(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return fallback;
    if (error instanceof SyntaxError) throw new Error(`Invalid JSON in ${file}. Fix that file and retry.`, { cause: error });
    throw error;
  }
}

export async function writeJson(file, value) {
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, file);
}

export async function withInstallLock(home, action) {
  await mkdir(home, { recursive: true, mode: 0o700 });
  const file = join(home, 'install.lock');
  let lock;
  try { lock = await open(file, 'wx', 0o600); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    throw new Error(`Another installation may be running. Check ${file}; if its process has exited, remove the lock and retry.`);
  }
  try {
    await lock.writeFile(`${JSON.stringify({ pid: process.pid, started: new Date().toISOString() })}\n`);
    return await action();
  } finally { await lock.close(); await rm(file, { force: true }); }
}

export function launcherText(home) {
  // Node resolves its entrypoint symlink to the release, keeping its imports there.
  return `#!/bin/sh\n# Intentum managed launcher\nexport INTENTUM_HOME=${shellQuote(home)}\nexec node ${shellQuote(join(home, 'current/node_modules', packageName, 'bin/intentum.mjs'))} "$@"\n`;
}

async function checkLauncher(file, home) {
  try {
    if (!(await lstat(file)).isFile() || (await readFile(file, 'utf8')) !== launcherText(resolve(home))) {
      throw new Error(`${file} already exists and is not an Intentum managed launcher. Choose INTENTUM_BIN_DIR or move it yourself.`);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}

export async function currentPackage(home) {
  return readJson(join(home, 'current/node_modules', packageName, 'package.json'), null);
}

export async function installRelease({ home, bin, spec = `${packageName}@latest`, expectedVersion, onlyIfNewer = false, run = capture }) {
  requireRuntime();
  return withInstallLock(home, async () => {
    const current = await currentPackage(home);
    if (onlyIfNewer && current && !newerStable(expectedVersion, current.version)) return current.version;
    await mkdir(bin, { recursive: true });
    await checkLauncher(join(bin, 'intentum'), home);
    await run('npm', ['--version'], { timeout: 10000 });
    const releases = join(home, 'releases');
    await mkdir(releases, { recursive: true });
    const stage = await mkdtemp(join(releases, 'release-'));
    let activated = false;
    const pointer = join(home, `current-${process.pid}`);
    try {
      await writeJson(join(stage, 'package.json'), { private: true });
      await run('npm', ['install', '--prefix', stage, '--ignore-scripts', '--no-audit', '--no-fund', '--save-exact', '--', spec], { timeout: 180000 });
      const root = join(stage, 'node_modules', packageName);
      const pkg = await readJson(join(root, 'package.json'));
      if (pkg?.name !== packageName || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(pkg.version) || (expectedVersion && pkg.version !== expectedVersion)) {
        throw new Error('Installed package identity or version did not match the requested release.');
      }
      if (!(await realpath(root)).startsWith(`${await realpath(stage)}/`)) {
        throw new Error('Release must be a packaged artifact, not a link to a working checkout.');
      }
      const cli = join(root, 'bin/intentum.mjs');
      const reported = await run(process.execPath, [cli, '--version'], { timeout: 30000 });
      if (reported !== pkg.version) throw new Error('Installed Intentum version check failed.');
      await run(process.execPath, [cli, '--intentum-check-runtime'], { timeout: 30000 });
      const shim = join(bin, `intentum-${process.pid}.tmp`);
      await writeFile(shim, launcherText(resolve(home)), { mode: 0o755 });
      await rename(shim, join(bin, 'intentum'));
      await writeJson(join(home, 'installation.json'), { bin: resolve(bin), packageName });
      await symlink(stage, pointer);
      await rename(pointer, join(home, 'current'));
      activated = true;
      return pkg.version;
    } finally {
      await rm(pointer, { force: true });
      if (!activated) await rm(stage, { recursive: true, force: true });
    }
  });
}
