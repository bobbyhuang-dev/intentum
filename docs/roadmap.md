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

- Deliver a minimalistic, aesthetically polished TUI with Intentum's visual
  identity and familiar Pi interactions. Present conversations, tool output,
  and activity states clearly, keeping routine output compact and details
  available on demand.
- Support themes, including two bundled defaults for day and night. Let users
  switch themes, preserve their selection across sessions, and add custom themes.
- Let users install Intentum with one command and reach a working session.
  Address prerequisites, executable availability, and model access setup as
  part of the onboarding experience.
- Support automatic updates as part of the same installation lifecycle.
- Make targeted TUI quality-of-life improvements based on actual coding use.

### Boundaries and decisions

Separate the TUI foundation from ongoing usability fixes. Stage 1 establishes
a dependable everyday experience; it does not require exhausting every possible
polish improvement. Continue improving the TUI as Stage 2 reveals real needs.

The Stage 1 interface should remain recognizably Pi-like, with Intentum's visual
identity and only a few targeted additions, rather than a broad UI redesign or
feature expansion. Reuse Pi's existing capabilities where practical. This bounded
UI scope does not reduce the installation, onboarding, or update requirements.

Using Claude's included subscription allowance without extra usage charges remains
an open question for further user investigation, not an agreed feature or Stage 1
completion requirement. No integration mechanism or billing guarantee is approved.

Updates should be predictable, preserve settings, explain when changes take
effect, and avoid disrupting active sessions. The exact policy for automatically
checking, downloading, and applying updates remains an implementation choice to
resolve. These are distinct behaviors, even when presented as auto-update.

### Completion criteria

- A new user can install Intentum, configure model access, complete a coding
  task, and return for another session without avoidable friction.
- The core TUI interactions work in the running terminal, with readable output
  and no blocking usability defects in that everyday flow. The display is compact
  without hiding important activity or failure states.
- Both bundled day/night themes are exercised in the running terminal with
  conversations, code, diffs, and tool success/error output. Theme switching,
  persistence across sessions, and loading a custom theme are verified.
- Both a fresh installation and an upgrade from an existing supported version
  have been exercised. Settings survive the upgrade and the updated version
  launches successfully.

Working locally does not establish that the installation command or update
channel is available to users; distribution readiness is part of this stage's
completion evidence.

### Partial implementation evidence (2026-09-06)

Implemented the non-TUI foundation using pinned Pi 0.85.1: a launcher with
isolated agent data, plain CLI setup/diagnostics, one-command installation from
the checkout, and versioned managed updates. Automatic updates check after
successful interactive sessions at most daily and activate verified newer stable
releases for the next launch. Users can disable them. This resolves the update
policy implementation choice above; see [distribution details](distribution.md).

Verified locally on macOS arm64 with Node 22.19.0 and 26.7.0, using npm 11.19.0:

- Eight unit tests covering prerequisite checks, environment isolation,
  update selection/throttling/opt-out, install locking, failed-update preservation,
  and protection of unrelated executables.
- An artifact lifecycle integration test installed `0.1.0-dev.0`, ran real Pi
  write/read tools against a deterministic local HTTP provider, upgraded to a
  synthetic `0.1.0-dev.1`, and resumed the saved conversation. Settings,
  credentials, model configuration, and session files survived the upgrade;
  both the new executable and the retained old release launched successfully.

**Stage 1 remains incomplete.** No TUI customization or theme work was performed.
Actual provider onboarding, public package installation and automatic updates
through a published channel, and running-terminal acceptance remain unverified.
The npm identity is provisional; no release was published. macOS/Linux Node
22.19/24 CI is configured but has not yet run. This is implementation and local
test evidence, not delivery or deployment evidence. The
[distribution guide](distribution.md#directory-and-integration-contract) records
the boundary for the separate TUI agent and remaining release work.

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
