import { spawn } from 'node:child_process';

export function capture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr = (stderr + data).slice(-8000); });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`${command} failed (${signal || code}). ${stderr.trim()}`));
    });
  });
}
