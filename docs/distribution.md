# Installation, model setup, and updates

Status: local Stage 1 foundation, implemented on 2026-09-06. No public Intentum
release has been published or verified. The package name
`@bobbyhuang-dev/intentum` is provisional until npm namespace ownership is
confirmed. The package version is `0.1.0-dev.0`.

## Install from this checkout

Prerequisites: macOS or Linux, Node.js **22.19 or newer**, and npm on `PATH`.
Check with `node --version` and `npm --version`. Install Node from
[nodejs.org](https://nodejs.org/en/download) or your existing version manager
if needed. Windows requires WSL with these prerequisites installed inside WSL;
native Windows installation is not implemented. No administrator privileges are
needed for the default directories.

From the repository root, run:

```sh
npm run install:local
```

This packs the checkout, installs the artifact and its dependencies in an
isolated directory, verifies both executable versions, and creates
`~/.local/bin/intentum`. It does not require an earlier `npm install` in the
checkout. Network access to npm is needed for uncached dependencies.

If the installer reports that the executable directory is missing from `PATH`,
add this to your shell configuration (for example `~/.zshrc`), then open another
terminal:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

You can immediately use `~/.local/bin/intentum` without editing your shell.
The installer prints the correct path when custom directories are used.
It refuses to overwrite an unrelated executable or another installation's launcher.

For development without a managed installation:

```sh
npm ci --ignore-scripts
npm start -- --intentum-setup
npm start
```

Development checkouts do not receive automatic updates. For a local artifact,
`node scripts/install.mjs /absolute/path/release.tgz` uses the same managed
lifecycle. Installing again is also the recovery path for an incomplete install.

## Configure model access

Run `intentum --intentum-setup` for a short guide. Provider authentication is
provided by the pinned Pi runtime. Supply a provider environment variable using
your shell or secret manager, or run `intentum` and use Pi's `/login` flow.
Intentum does not introduce a credential store or copy credentials from an
existing Pi installation. Provider/account eligibility and billing remain with
the provider; Claude subscription billing is outside this milestone's scope.

In the running session, use `/model` to select a model; Ctrl+S in the picker saves
the startup default. Ask for a small coding change in a scratch workspace, exit,
and run `intentum -c` from that directory to continue the saved session.
`intentum --intentum-doctor` checks the runtime, writable agent directory,
installation marker, and executable directory on `PATH`. It does not contact a
model provider or display credentials. Pi's `auth` commands are also passed
through; consult `intentum auth --help` for its readiness checks.

Settings, provider credentials, sessions, and global Pi resources live under
`~/.intentum/agent`. Upgrades never copy, migrate, or delete this directory.
Project resources continue using Pi's existing `.pi/` convention.

## Update policy

Managed installations enable automatic updates by default. After a normal
interactive session exits successfully, Intentum checks npm's `latest` tag at
most once per 24 hours. A newer stable version is downloaded, installed with
dependency lifecycle scripts disabled, and checked before an atomic switch of
the `current` symlink. It takes effect on the **next launch**. Existing sessions
keep their release files; old releases are retained. This also permits other
Intentum sessions to stay open during installation.

Checks, downloads, and activation happen after the session, in the foreground;
there is no resident background service. The registry check has a 15-second
timeout and dependency installation has a three-minute timeout. Failed checks
are throttled too. Failures report recovery instructions and keep the previous
release selected when installation or validation fails. An interrupted process
can leave an installation lock; inspect its recorded PID and remove the lock
only after confirming that process has exited. A new install uses a fresh
staging directory instead of replaying a partially installed directory.

```sh
intentum --intentum-update             # Check and apply a newer stable release now
intentum --intentum-auto-update off    # Persistently disable automatic updates
intentum --intentum-auto-update on     # Re-enable
```

`INTENTUM_NO_UPDATE=1` skips automatic updates for one process. Print, RPC,
offline, help, and package-management commands do not trigger automatic updates.
Explicit `--intentum-update` contacts npm even when automatic updates are off.
Until there is a public release, a registry lookup may fail; local artifacts can
still be installed with the installer. No registry publication is implied by
successful local tests.

Pi's self-update commands, including bare `update` and `update --all`, are
rejected with instructions to use `--intentum-update`. Pi extension and model
catalog updates remain available through their explicit targets.

## Directory and integration contract

| Setting | Default | Purpose |
| --- | --- | --- |
| `INTENTUM_HOME` | `~/.local/share/intentum` | Releases, active pointer, install lock, update preferences |
| `INTENTUM_BIN_DIR` | `~/.local/bin` | Installer's executable destination |
| `INTENTUM_AGENT_DIR` | `~/.intentum/agent` | Pi settings, auth, sessions, and global resources |

The launcher records the installation root; keep `INTENTUM_AGENT_DIR` set across
sessions when using a custom agent directory. Paths must be trusted local
directories. Configuration files are created with private permissions. Node
must remain available on `PATH` when launching the installed executable.

The TUI agent can build on the exact dependency
`@earendil-works/pi-coding-agent@0.85.1`. The package moved from its former
`@mariozechner` scope; see the [upstream repository](https://github.com/earendil-works/pi)
and [extension documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md).
The design follows Pi's existing CLI and package conventions rather than
forking its runtime. The source for this dependency is also included in its
installed distribution for inspection.

- `src/pi.mjs` resolves the dependency's declared CLI and supplies the isolated
  agent directory. This is the runtime integration point.
- `bin/intentum.mjs` owns lifecycle options prefixed `--intentum-`; other
  arguments go to Pi. Its child inherits terminal streams, working directory,
  and provider environment variables. Exit status and signals are propagated.
- No Pi assets, renderers, themes, terminal interactions, or dependency files
  are modified. Visible Pi branding remains for the TUI agent to handle.
- Bundle future extensions/themes in the release and load them at the runtime
  boundary. Do not install managed assets into the user's agent directory or
  overwrite their settings during upgrades.
- Theme selection and custom themes, Intentum branding, TUI onboarding screens,
  and visual acceptance checks belong to the separate TUI work.

## Verification and public release work

`npm test` covers prerequisites, environment isolation, update policy, failed
installs, version selection, locking, and unrelated executable protection.
`npm run test:install` uses actual packed artifacts and the pinned Pi runtime in
temporary directories. A local deterministic HTTP provider issues real write
and read tool calls, and the test resumes a session after installing a synthetic
next version. It verifies settings/auth/model bytes, session files, executable
availability, and continued access to the prior release. It makes no paid model
requests. These tests exercise plumbing, not model intelligence or real provider
login. The integration test requires npm network/cache access.

Before claiming public distribution readiness:

1. Confirm the npm namespace/package identity and project license, and set a
   release version. If the package name changes, update `src/config.mjs`,
   `package.json`, and the shrinkwrap together.
2. Run unit and artifact lifecycle tests on the intended platform/Node matrix.
   CI is configured for macOS and Linux on Node 22.19 and 24; configured CI is
   not evidence that those jobs have run.
3. Publish and verify the package and release notes. The intended public
   installation command is `npx --yes --ignore-scripts
   --package=@bobbyhuang-dev/intentum intentum-install`, but it is **not yet
   available or verified**. Check executable discovery in a clean shell.
4. Exercise a real provider login/API-key flow, a coding task, and return session.
5. Exercise an upgrade through the published `latest` channel, including the
   automatic post-session trigger. Local tests use synthetic releases and a
   simulated update registry; they are not public channel verification.

Publishing, release tagging, installing into the developer's real home directory,
and paid provider calls were not performed for this implementation.
