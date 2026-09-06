import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capture } from '../src/process.mjs';
import { spawnSync } from 'node:child_process';

const temp = await mkdtemp(join(tmpdir(), 'intentum-pack-'));
try {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const packed = JSON.parse(await capture('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], { cwd: root }));
  const result = spawnSync(process.execPath, [join(root, 'scripts/install.mjs'), join(temp, packed[0].filename)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { await rm(temp, { recursive: true, force: true }); }
