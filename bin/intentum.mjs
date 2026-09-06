#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { metadata, paths, requireRuntime, binOnPath, isManagedRuntime } from '../src/config.mjs';
import { piEntrypoint, piEnvironment } from '../src/pi.mjs';
import { readJson, writeJson } from '../src/install.mjs';
import { update } from '../src/update.mjs';
import { capture } from '../src/process.mjs';
import { updatesPiItself, automaticUpdatesAllowed } from '../src/args.mjs';

const args = process.argv.slice(2);
const options = args.includes('--') ? args.slice(0, args.indexOf('--')) : args;
const config = paths();

function setup() {
  console.log(`Intentum stores settings, credentials, and sessions in ${config.agent}.

Configure model access using either:
  • A provider environment variable, for example ANTHROPIC_API_KEY or OPENAI_API_KEY.
    Set it in your shell or secret manager before launching Intentum.
  • Pi's existing authentication flow: launch intentum, then use /login.
    Provider availability and account eligibility are determined by the provider.

Run intentum and select a model with /model. Save it as the startup default using
Ctrl+S in the model picker. Try a small coding task, then exit and run intentum -c
from the same directory to continue. Use intentum --intentum-doctor for diagnostics.

Updates: managed installs check after normal interactive sessions at most daily.
New releases apply on the next launch. Disable with --intentum-auto-update off;
check manually with --intentum-update. Print/RPC/offline runs do not auto-update.`);
}

async function runPi(cli, env) {
  const child = spawn(process.execPath, [cli, ...args], { env, stdio: 'inherit' });
  // Keep the wrapper alive while the child owns terminal interaction. Signals sent
  // directly to this wrapper still reach the child (Ctrl+C also reaches its group).
  const forward = (signal) => () => child.kill(signal);
  const handlers = new Map(['SIGINT', 'SIGTERM', 'SIGHUP'].map((signal) => [signal, forward(signal)]));
  for (const [signal, handler] of handlers) process.on(signal, handler);
  try {
    return await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => resolve({ code, signal }));
    });
  } finally {
    for (const [signal, handler] of handlers) process.off(signal, handler);
  }
}

try {
  requireRuntime();
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    console.log(metadata.version);
  } else if (args[0] === '--intentum-setup' && args.length === 1) {
    setup();
  } else if (args[0] === '--intentum-auto-update' && args.length === 2 && ['on', 'off'].includes(args[1])) {
    await mkdir(config.home, { recursive: true, mode: 0o700 });
    const file = join(config.home, 'updates.json');
    await writeJson(file, { ...await readJson(file, {}), enabled: args[1] === 'on' });
    console.log(`Automatic updates ${args[1]}.`);
  } else if (args[0] === '--intentum-update' && args.length === 1) {
    if (!await isManagedRuntime(config.home)) throw new Error('Run --intentum-update using the managed intentum executable. This runtime is a checkout or an unmanaged install.');
    await update(config);
  } else if (args[0] === '--intentum-doctor' && args.length === 1) {
    await mkdir(config.agent, { recursive: true, mode: 0o700 });
    await access(config.agent, constants.W_OK);
    const cli = await piEntrypoint();
    const version = await capture(process.execPath, [cli, '--version'], { env: piEnvironment(process.env, config.agent), timeout: 30000 });
    const installation = await readJson(join(config.home, 'installation.json'), null);
    const executableDir = installation?.bin || config.bin;
    console.log(`Intentum ${metadata.version}\nNode ${process.versions.node}\nPi ${version}\nAgent directory writable: ${config.agent}\nExecutable directory on PATH: ${binOnPath(executableDir) ? 'yes' : 'no — add ' + executableDir}\nManaged runtime: ${await isManagedRuntime(config.home) ? 'yes' : 'no'}\nModel connectivity is not checked. Use --intentum-setup for authentication instructions.`);
  } else if (args[0] === '--intentum-check-runtime' && args.length === 1) {
    console.log(await capture(process.execPath, [await piEntrypoint(), '--version'], { env: piEnvironment(process.env, config.agent), timeout: 30000 }));
  } else if (options.some((arg) => arg.startsWith('--intentum-'))) {
    throw new Error('Intentum options: --intentum-setup, --intentum-doctor, --intentum-update, --intentum-auto-update on|off. Use each separately.');
  } else {
    if (updatesPiItself(options)) {
      throw new Error('Use intentum --intentum-update to update the managed Intentum runtime.');
    }
    if (options.includes('--help') || options.includes('-h')) console.log('Intentum: --intentum-setup | --intentum-doctor | --intentum-update | --intentum-auto-update on|off\nOther options are provided by the bundled Pi runtime:\n');
    await mkdir(config.agent, { recursive: true, mode: 0o700 });
    const result = await runPi(await piEntrypoint(), piEnvironment(process.env, config.agent));
    if (result.code === 0 && automaticUpdatesAllowed(options, { tty: process.stdin.isTTY && process.stdout.isTTY, env: process.env }) && await isManagedRuntime(config.home)) {
      try { await update({ ...config, automatic: true }); }
      catch (error) { console.error(`Intentum update failed: ${error.message}\nRetry with --intentum-update; session files were not changed by the updater.`); }
    }
    if (result.signal) {
      process.kill(process.pid, result.signal);
    } else process.exitCode = result.code ?? 1;
  }
} catch (error) {
  console.error(`Intentum: ${error.message}`);
  process.exitCode = 1;
}
