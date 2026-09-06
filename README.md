# Intentum

Intentum is a customized Pi agent intended to help developers ship high-quality
products with less time and effort. It is a toolbox of optional capabilities,
not a prescribed development workflow, with a direct and lightweight experience.

## Current status

Intentum has a local Stage 1 foundation: a Pi-based launcher, model setup guidance,
isolated settings, a managed installer, and automatic update support. No public
release is available yet. TUI customization and themes are pending, and neither
stage below is complete. See the [Stage 1 evidence](docs/roadmap.md#partial-implementation-evidence-2026-09-06)
and [distribution guide](docs/distribution.md) for verified scope and remaining work.

## Try the local foundation

With Node.js 22.19+ and npm installed, run from this checkout:

```sh
npm run install:local
~/.local/bin/intentum --intentum-setup
```

The installer prints executable/PATH instructions. Launch `intentum` after setup;
use `intentum -c` to return to your session. The terminal currently uses unchanged
Pi UI. Installation and update policy are documented in the
[distribution guide](docs/distribution.md).

## Planned stages

1. **Everyday experience and distribution:** Establish a minimal, polished,
   Pi-like TUI with Intentum's visual identity and day/night themes, one-command
   installation, model access setup, automatic updates, and a dependable everyday
   coding experience.
2. **Optional QA-loop MVP and supporting TUI:** Let a QA lead discover defects,
   delegate bounded repairs, and independently verify results. Build a supervised
   loop with one workspace and one active repair worker, visible progress,
   cancellation, and saved results. Automatic continuation and other extensions
   are outside this stage's scope.

The [roadmap](docs/roadmap.md) owns stage scope, sequencing, and completion
criteria. Stage descriptions include planned work, not just implemented features.

## Documentation guide

| Document | Read it for |
| --- | --- |
| [Vision and principles](docs/vision.md) | Product direction and design trade-offs. |
| [Roadmap](docs/roadmap.md) | Stage scope, order, and completion criteria. |
| [Distribution](docs/distribution.md) | Local installation, model setup, updates, and TUI integration boundary. |
| [QA-loop overview](docs/feat/qa-loop.md) | Feature concept and design entry point. |
| [QA-loop MVP](docs/feat/qa-loop-mvp.md) | Initial implementation scope and acceptance requirements. |
| [QA-loop extra features](docs/feat/qa-loop-extra-features.md) | Candidate extensions and when they might be worthwhile. |
| [Agent guidance](AGENTS.md) | Repository working instructions and task-specific reading requirements. |

New to the project? Start here, then read the vision and roadmap. Read the
QA-loop overview for the feature concept and the MVP specification when working
on the initial tool. Extra features are candidates, not release commitments.
