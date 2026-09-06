export function updatesPiItself(args) {
  if (args[0] !== 'update' || args.includes('--help') || args.includes('-h')) return false;
  const rest = args.slice(1);
  if (rest.some((arg) => ['self', 'pi', '--self', '--pi', '--all'].includes(arg))) return true;
  if (rest.some((arg) => ['--models', '--extensions', '--extension'].includes(arg))) return false;
  return !rest.some((arg) => !arg.startsWith('-'));
}

export function automaticUpdatesAllowed(args, { tty, env }) {
  return Boolean(tty) && env.INTENTUM_NO_UPDATE !== '1' && !/^(1|true|yes)$/i.test(env.PI_OFFLINE || '') &&
    !args.some((arg) => ['-p', '--print', '--offline', '--mode', '--help', '-h', '--list-models'].includes(arg) || arg.startsWith('--mode=')) &&
    !['install', 'remove', 'uninstall', 'update', 'list', 'config', 'auth'].includes(args[0]);
}
