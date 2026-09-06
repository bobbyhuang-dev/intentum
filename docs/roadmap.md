# Intentum roadmap

Status: agreed direction for Stages 1 and 2; an incomplete roadmap, not an
inventory of implemented features. Updated: 2026-09-06.

This roadmap follows the [project vision](vision.md). Stage 1 makes Intentum
easy to adopt and dependable for everyday coding. Stage 2 introduces the
optional QA loop as its first substantial tool. See the [README](../README.md)
for current project status. Record completion evidence under the relevant stage
here, including the environments, versions, and checks actually verified.

## Stage 1: Everyday experience and distribution

### Scope

- Customize the TUI with Intentum's visual identity, readable conversations and
  tool output, and consistent core interactions.
- Let users install Intentum with one command and reach a working session.
  Address prerequisites, executable availability, and model access setup as
  part of the onboarding experience.
- Support automatic updates as part of the same installation lifecycle.
- Make targeted TUI quality-of-life improvements based on actual coding use.

### Boundaries and decisions

Separate the TUI foundation from ongoing usability fixes. Stage 1 establishes
a dependable everyday experience; it does not require exhausting every possible
polish improvement. Continue improving the TUI as Stage 2 reveals real needs.

Updates should be predictable, preserve settings, explain when changes take
effect, and avoid disrupting active sessions. The exact policy for automatically
checking, downloading, and applying updates remains an implementation choice to
resolve. These are distinct behaviors, even when presented as auto-update.

### Completion criteria

- A new user can install Intentum, configure model access, complete a coding
  task, and return for another session without avoidable friction.
- The core TUI interactions work in the running terminal, with readable output
  and no blocking usability defects in that everyday flow.
- Both a fresh installation and an upgrade from an existing supported version
  have been exercised. Settings survive the upgrade and the updated version
  launches successfully.

Working locally does not establish that the installation command or update
channel is available to users; distribution readiness is part of this stage's
completion evidence.

## Stage 2: QA-loop MVP and supporting TUI

### Scope

- Develop the supervised optional loop specified in
  [QA-loop MVP](feat/qa-loop-mvp.md), the implementation and acceptance reference
  for this stage.
- Develop its supporting TUI alongside the loop, beginning with the first
  complete user flow.
- Preserve progress and partial changes for inspection after interruption.
  Automatic continuation and unattended operation are outside this stage.

[Extra features](feat/qa-loop-extra-features.md) are candidates, not Stage 2
completion requirements. Adopt them only after evidence or concrete user needs
justify their complexity, with explicit scope and acceptance criteria.

### First working milestone

Start with one target workspace, one QA lead, and one active repair worker.
Prove a complete flow against a real target:

1. Find a reproducible defect.
2. Delegate a bounded repair.
3. Independently verify the repaired behavior.
4. Report the verified outcome and any remaining limitations.

The same milestone should let the user start QA, follow progress, stop the run,
and inspect its result through the TUI, with bounded attempts, saved evidence,
and preservation of user changes. Start the comparison against a single-agent
baseline in this milestone, before expanding the orchestration. Then complete
required coverage and safe stopping around this foundation, following the MVP
specification's implementation sequence.

### TUI expectations

Keep the normal display compact and make detailed activity and evidence
available on demand. The user should be able to understand:

- What is being checked.
- Whether Intentum is investigating, repairing, or verifying.
- Which fixes have been independently verified and which remain unresolved.
- Why the run stopped and whether any user action is needed.

### Completion criteria

- The core loop works through the visible TUI against real target tasks;
  internal tests alone are insufficient.
- Required discovery, final-candidate verification, limits, cancellation, and
  interruption handling work within the MVP's supported scope. Saved progress
  and uncertain edits can be inspected without automatically replaying actions;
  automatic resume is not required.
- Reports distinguish proposed repairs, verified fixes, unresolved findings,
  and coverage gaps. A successful run does not claim that the product has no bugs.
- A small set of representative tasks provides evidence of better results or
  reduced user intervention compared with asking one agent to perform equivalent
  QA. Record quality, user intervention, time, and usage or cost where available
  so the trade-offs are visible. Do not claim benefits before measuring them.

## Sequencing rationale

Keep Stage 1 bounded so open-ended TUI polish does not delay learning whether
the QA loop delivers value. Build the Stage 2 engine and interface together so
real use exposes missing behavior early. Keep the initial loop complete but small:
measure delegation's value before investing in automatic recovery, extra agents,
or selective evidence reuse. If it does not improve results or reduce user
intervention, revisit the design before expanding it.

Later stages, dates, supported platforms, distribution mechanics, update policy,
and the first QA evaluation tasks are not yet specified here. This roadmap does
not turn those open choices into requirements or promise additional features.
