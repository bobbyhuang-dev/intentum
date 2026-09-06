import { homedir } from 'node:os';
import { resolve, join, delimiter } from 'node:path';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const packageName = '@bobbyhuang-dev/intentum';
export const piPackageName = '@earendil-works/pi-coding-agent';
export const packageRoot = new URL('../', import.meta.url);
export const metadata = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));

export function paths(env = process.env) {
  const expand = (value) => resolve(value.startsWith('~/') ? join(homedir(), value.slice(2)) : value);
  return {
    home: expand(env.INTENTUM_HOME || join(homedir(), '.local/share/intentum')),
    bin: expand(env.INTENTUM_BIN_DIR || join(homedir(), '.local/bin')),
    agent: expand(env.INTENTUM_AGENT_DIR || join(homedir(), '.intentum/agent')),
  };
}

export function requireRuntime(version = process.versions.node, platform = process.platform) {
  const [major, minor] = version.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 19)) {
    throw new Error('Intentum requires Node.js 22.19 or newer. Install a supported Node.js release, then retry.');
  }
  if (!['darwin', 'linux'].includes(platform)) {
    throw new Error('This installation supports macOS and Linux. On Windows, use WSL with Node.js installed inside WSL.');
  }
}

export function binOnPath(bin, env = process.env) {
  return (env.PATH || '').split(delimiter).some((entry) => entry && resolve(entry) === bin);
}

export async function isManagedRuntime(home, runtimeRoot = fileURLToPath(packageRoot)) {
  try {
    const releases = await realpath(join(home, 'releases'));
    return (await realpath(runtimeRoot)).startsWith(`${releases}/`);
  } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
