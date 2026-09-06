export function newerStable(candidate, current) {
  if (!/^\d+\.\d+\.\d+$/.test(candidate)) return false;
  const next = candidate.split('.').map(Number);
  const before = current.split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (next[i] !== before[i]) return next[i] > before[i];
  }
  return current.includes('-');
}
