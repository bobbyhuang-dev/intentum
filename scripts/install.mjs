#!/usr/bin/env node
import { paths, binOnPath } from '../src/config.mjs';
import { installRelease, shellQuote } from '../src/install.mjs';
import { resolve } from 'node:path';

try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args[0]?.startsWith('-')) throw new Error('Usage: intentum-install [local-release.tgz]');
  const spec = args[0] ? resolve(args[0]) : undefined;
  if (spec && !spec.endsWith('.tgz')) throw new Error('Local installations require an npm-packed .tgz artifact.');
  const config = paths();
  const version = await installRelease({ ...config, spec });
  console.log(`Installed Intentum ${version}. Run ${config.bin}/intentum --intentum-setup for model setup.`);
  if (!binOnPath(config.bin)) {
    console.log(`Add ${config.bin} to PATH in your shell configuration, then open a new terminal.\nFor zsh/bash: export PATH=${shellQuote(config.bin)}:"$PATH"`);
  } else console.log('Run intentum to start, or intentum -c to continue your previous session.');
  console.log('Managed installs check for updates after interactive sessions, at most daily. Use --intentum-auto-update off to disable.');
} catch (error) {
  console.error(`Intentum installation failed: ${error.message}`);
  process.exitCode = 1;
}
