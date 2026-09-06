import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, cp, readFile, writeFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capture } from '../../src/process.mjs';
import { metadata, packageName } from '../../src/config.mjs';

test('packed fresh install, coding tool call, upgrade, and continued session with actual Pi', { timeout: 240000 }, async (t) => {
  const temp = await mkdtemp(join(tmpdir(), "intentum lifecycle 'space-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const home = join(temp, 'installation');
  const bin = join(temp, 'bin');
  const agent = join(temp, 'agent');
  const work = join(temp, 'workspace');
  await mkdir(agent);
  await mkdir(work);
  const env = { PATH: process.env.PATH, INTENTUM_HOME: home, INTENTUM_BIN_DIR: bin, INTENTUM_AGENT_DIR: agent, INTENTUM_NO_UPDATE: '1', PI_OFFLINE: '1', PI_TELEMETRY: '0' };
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const request = JSON.parse(body);
    requests.push(request);
    const turn = requests.length;
    const tool = turn === 1 ? { name: 'write', arguments: JSON.stringify({ path: 'greeting.txt', content: 'Hello from Intentum!\n' }) } :
      turn === 3 ? { name: 'read', arguments: JSON.stringify({ path: 'greeting.txt' }) } : null;
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const chunk = (delta, finish_reason = null) => res.write(`data: ${JSON.stringify({ id: `completion-${turn}`, object: 'chat.completion.chunk', created: 1, model: 'fixture', choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
    chunk({ role: 'assistant', ...(tool ? { tool_calls: [{ index: 0, id: `call-${turn}`, type: 'function', function: tool }] } : { content: 'Verified greeting.txt.' }) });
    chunk({}, tool ? 'tool_calls' : 'stop');
    res.end('data: [DONE]\n\n');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await writeFile(join(agent, 'models.json'), JSON.stringify({ providers: { fixture: { baseUrl: `http://127.0.0.1:${server.address().port}/v1`, api: 'openai-completions', apiKey: 'test-only', models: [{ id: 'fixture', contextWindow: 32000, maxTokens: 4096 }] } } }));
  const settings = JSON.stringify({ defaultProvider: 'fixture', defaultModel: 'fixture', quietStartup: true });
  await writeFile(join(agent, 'settings.json'), settings);
  await writeFile(join(agent, 'auth.json'), '{"fixture":{"type":"api_key","key":"test-only"}}');
  async function pack(directory) {
    const result = JSON.parse(await capture('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], { cwd: directory, timeout: 30000 }));
    return join(temp, result[0].filename);
  }
  const first = await pack(root);
  const installOutput = await capture(process.execPath, [join(root, 'scripts/install.mjs'), first], { env, cwd: work, timeout: 180000 });
  assert.match(installOutput, /Installed Intentum/);
  assert.match(installOutput, /Add .* to PATH/);
  const executable = join(bin, 'intentum');
  assert.equal(await capture(executable, ['--version'], { env }), metadata.version);
  assert.match(await capture(executable, ['--intentum-doctor'], { env }), /Pi 0.85.1/);
  const oldRelease = await realpath(join(home, 'current'));
  const args = ['-p', '--no-extensions', '--no-skills', '--no-context-files', '--no-prompt-templates', '--no-themes', '--offline', '--provider', 'fixture', '--model', 'fixture'];
  const firstRun = await capture(executable, [...args, 'Create greeting.txt containing Hello from Intentum!'], { env, cwd: work, timeout: 30000 });
  assert.match(firstRun, /Verified greeting.txt/);
  assert.equal(await readFile(join(work, 'greeting.txt'), 'utf8'), 'Hello from Intentum!\n');
  assert.equal(requests.length, 2);
  assert.equal(requests[1].messages.at(-1).role, 'tool');
  const saved = Object.fromEntries(await Promise.all(['settings.json', 'auth.json', 'models.json'].map(async (file) => [file, await readFile(join(agent, file), 'utf8')])));
  const sessionsBefore = await readdir(join(agent, 'sessions'), { recursive: true });
  assert.ok(sessionsBefore.some((name) => name.endsWith('.jsonl')));

  // A synthetic next version exercises the actual npm upgrade lifecycle without
  // pretending that two Intentum releases have already been published.
  const candidate = join(temp, 'candidate');
  await mkdir(candidate);
  for (const name of ['bin', 'src', 'scripts', 'docs', 'README.md', 'package.json', 'npm-shrinkwrap.json']) await cp(join(root, name), join(candidate, name), { recursive: true });
  const next = { ...metadata, version: '0.1.0-dev.1' };
  await writeFile(join(candidate, 'package.json'), JSON.stringify(next));
  const lock = JSON.parse(await readFile(join(candidate, 'npm-shrinkwrap.json')));
  lock.version = next.version;
  lock.packages[''].version = next.version;
  await writeFile(join(candidate, 'npm-shrinkwrap.json'), JSON.stringify(lock));
  const second = await pack(candidate);
  await capture(process.execPath, [join(root, 'scripts/install.mjs'), second], { env, cwd: work, timeout: 180000 });
  assert.equal(await capture(executable, ['--version'], { env }), next.version);
  assert.equal(await capture(process.execPath, [join(oldRelease, 'node_modules', packageName, 'bin/intentum.mjs'), '--version'], { env }), metadata.version);
  for (const [file, bytes] of Object.entries(saved)) assert.equal(await readFile(join(agent, file), 'utf8'), bytes);
  assert.deepEqual(await readdir(join(agent, 'sessions'), { recursive: true }), sessionsBefore);
  const secondRun = await capture(executable, [...args, '-c', 'Read the file we just created.'], { env, cwd: work, timeout: 30000 });
  assert.match(secondRun, /Verified greeting.txt/);
  assert.equal(requests.length, 4);
  assert.match(JSON.stringify(requests[2].messages), /Create greeting.txt/);
  assert.match(JSON.stringify(requests[3].messages.at(-1)), /Hello from Intentum!/);
});
