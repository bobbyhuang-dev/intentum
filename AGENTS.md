# Intentum: project guidance

## Purpose

Intentum is a customized Pi agent that aims to save developers time and energy,
improve generated code quality, and help them ship high-quality products.

## Core philosophy

- **A well-configured toolbox, not a prescribed workflow.** Developers choose the
  tools that help them. The adaptive QA loop is the first planned tool; a UI
  designer is another possible tool. Neither is a required stage or a claim
  of existing functionality.
- **Direct and easy to follow.** Keep the experience lightweight and
  understandable, in alignment with Pi's philosophy. Added capability should not
  make Intentum feel heavy, confusing, or complex.

Apply these principles to fixes, features, architecture, and product decisions.

## Working essentials

- Define the outcome and how it will be verified. Be explicit about whether
  “done” includes implementation, testing, inspection, delivery, or deployment.
- Study relevant existing tools and designs before reinventing them.
- Distinguish requirements from suggestions and unimplemented ideas. Leave
  methods flexible when they do not affect correctness or safety.
- Keep instructions focused and non-duplicative; load details only when relevant.
- Complete authorized work without repeated confirmation. Stop for missing
  required input, exhausted authorization, or attempts that no longer make useful
  progress. Prepare concrete results for review when possible.
- Make failures and recovery paths clear. Before retrying side effects, check
  whether the previous attempt already succeeded.
- Distinguish attempted work from verified results. Run required and relevant
  checks, then stop when the evidence is sufficient.

## Detailed guidance and continuity

Read [docs/vision.md](docs/vision.md) before designing or changing features,
tools, skills, agent instructions, or harness behavior, and when evaluating
product direction or trade-offs. It contains the full development principles;
this file is their concise entry point.

Read [docs/roadmap.md](docs/roadmap.md) when planning milestones or evaluating
stage completion. It records agreed scope and completion criteria; it is not
an inventory of implemented features.

Read [docs/feat/qa-loop-mvp.md](docs/feat/qa-loop-mvp.md) before implementing or
changing the QA loop. It is the initial scope's implementation and acceptance
reference. For extensions, read relevant sections of
[docs/feat/qa-loop-extra-features.md](docs/feat/qa-loop-extra-features.md); these
candidates are not MVP requirements or implementation commitments.

Keep these documents aligned as the project evolves. Preserve significant agreed
decisions and their rationale in project documentation rather than only in chat.
For interrupted work, record the goal, decisions, completed and remaining work,
and the scope of permissions; do not treat stale notes as renewed authorization
or let them override newer instructions.

## README maintenance

Update [README.md](README.md) for published releases, completed stages, and
material changes to direction, scope, or setup:
- Releases: record the published version, link release notes, and refresh
  availability and setup information.
- Stages: record completion evidence in the roadmap before claiming completion,
  then update README status and link to that evidence.

Keep the README concise; link to authoritative details rather than duplicating them.
