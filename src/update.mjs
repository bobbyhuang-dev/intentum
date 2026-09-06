import { join } from 'node:path';
import { readJson, writeJson, installRelease, currentPackage } from './install.mjs';
import { packageName } from './config.mjs';
import { capture } from './process.mjs';
import { newerStable } from './version.mjs';

export async function update({ home, automatic = false, run = capture, install = installRelease, now = Date.now(), log = console.error }) {
  const installation = await readJson(join(home, 'installation.json'), null);
  if (!installation) {
    if (automatic) return;
    throw new Error('Updates require a managed install. Run npm run install:local from the checkout, or use intentum-install from a published package.');
  }
  const prefs = await readJson(join(home, 'updates.json'), {});
  if (automatic && (prefs.enabled === false || now - (prefs.lastCheck || 0) < 86400000)) return;
  // Throttle failed checks too, so an unavailable registry does not nag each session.
  await writeJson(join(home, 'updates.json'), { ...prefs, lastCheck: now });
  const current = await currentPackage(home);
  if (!current) throw new Error('Managed installation is incomplete. Run the installer again.');
  log('Intentum: checking for updates…');
  const candidate = JSON.parse(await run('npm', ['view', `${packageName}@latest`, 'version', '--json'], { timeout: 15000 }));
  if (typeof candidate !== 'string') throw new Error('Update registry returned an invalid version.');
  if (!newerStable(candidate, current.version)) {
    if (!automatic) log(`Intentum ${current.version} is current; no newer stable release was found.`);
    return;
  }
  log(`Intentum: installing ${candidate} for the next launch…`);
  const version = await install({ home, bin: installation.bin, spec: `${packageName}@${candidate}`, expectedVersion: candidate, onlyIfNewer: true, run });
  log(`Intentum ${version} is ready. It takes effect on the next launch; existing sessions keep their current version.`);
}
