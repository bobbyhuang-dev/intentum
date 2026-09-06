# Intentum

Intentum is a customized Pi agent intended to help developers ship high-quality
products with less time and effort. It is a toolbox of optional capabilities,
not a prescribed development workflow, with a direct and lightweight experience.

## Current status

Intentum is in planning and design. This repository currently contains project
guidance and design documents, with no implementation or installable release.
Neither stage below is complete.

## Planned stages

1. **Everyday experience and distribution:** Establish Intentum's TUI identity,
   one-command installation, model access setup, automatic updates, and a
   dependable everyday coding experience.
2. **Optional QA-loop MVP and supporting TUI:** Let a QA lead discover defects,
   delegate bounded repairs, and independently verify results. Build a supervised
   loop with one workspace and one active repair worker, visible progress,
   cancellation, and saved results. Automatic continuation and other extensions
   are outside this stage's scope.

The [roadmap](docs/roadmap.md) owns stage scope, sequencing, and completion
criteria. These are plans, not available features or release commitments.

## Documentation guide

| Document | Read it for |
| --- | --- |
| [Vision and principles](docs/vision.md) | Product direction and design trade-offs. |
| [Roadmap](docs/roadmap.md) | Stage scope, order, and completion criteria. |
| [QA-loop overview](docs/feat/qa-loop.md) | Feature concept and design entry point. |
| [QA-loop MVP](docs/feat/qa-loop-mvp.md) | Initial implementation scope and acceptance requirements. |
| [QA-loop extra features](docs/feat/qa-loop-extra-features.md) | Candidate extensions and when they might be worthwhile. |
| [Agent guidance](AGENTS.md) | Repository working instructions and task-specific reading requirements. |

New to the project? Start here, then read the vision and roadmap. Read the
QA-loop overview for the feature concept and the MVP specification when working
on the initial tool. Extra features are candidates, not release commitments.
