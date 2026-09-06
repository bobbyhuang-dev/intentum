import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { piPackageName } from './config.mjs';

export async function piEntrypoint() {
  // Resolve the public export, then locate the package's declared executable.
  // The CLI lives in a different directory from the SDK in current Pi releases.
  let root = dirname(fileURLToPath(import.meta.resolve(piPackageName)));
  while (dirname(root) !== root) {
    try {
      const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
      if (pkg.name === piPackageName) {
        const cli = join(root, pkg.bin.pi);
        await access(cli);
        return cli;
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    root = dirname(root);
  }
  throw new Error('Pi runtime is missing. Reinstall Intentum.');
}

export function piEnvironment(env, agent) {
  const result = { ...env, PI_CODING_AGENT_DIR: agent };
  // An inherited Pi package override would load another package's assets/config.
  delete result.PI_PACKAGE_DIR;
  delete result.PI_CODING_AGENT_SESSION_DIR;
  return result;
}
