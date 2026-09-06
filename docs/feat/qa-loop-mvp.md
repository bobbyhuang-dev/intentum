# QA loop: MVP specification

Status: agreed initial design scope; not implemented. Updated: 2026-09-06.

This document is the implementation and acceptance reference for the supervised
QA-loop MVP in [Stage 2](../roadmap.md#stage-2-qa-loop-mvp-and-supporting-tui).
Read the [vision](../vision.md) before changing it. The
[extra features](qa-loop-extra-features.md) are candidates, not MVP requirements.

Requirements below define supported behavior. Items explicitly labeled
suggestions or open choices remain flexible; conceptual fields are not a fixed
API or a requirement for separate modules or database tables.

## 1. Outcome and scope

The developer can ask a QA lead to investigate a local product, delegate bounded
repairs, independently verify them, and report what was checked and what remains.
The MVP must be a complete usable tool, with visible progress and cancellation.
Supervised means the user can inspect results and resolve blockers; it does not
mean approval is required for every authorized investigation or repair.

Supported scope:

- One selected workspace, one QA lead, and one active repair worker at a time.
- Report-only investigation or investigation with authorized local repairs.
- A required scenario checklist and bounded exploration of additional risky areas.
- Existing project checks and available product interaction tools.
- Saved progress, evidence, and results that remain inspectable after interruption.

Not included: automatic continuation after interruption, a fresh audit agent,
dependency-based reuse of old verification, automatic model escalation, or
automatic worktree integration. See the extra-features document for candidates.
Parallel writers, recursive delegation, a general workflow builder, and a
universal test runner are outside MVP scope. QA does not imply authorization to
commit, push, publish, deploy, or release. No outcome guarantees a bug-free product.

Supported product environments must be named and exercised during implementation;
the design does not promise every browser, native app, terminal, or platform.
Missing required tools or access produce an explicit coverage gap, not a silent
substitution of code review for product testing.

## 2. Entry point and user experience

Use natural language through Pi, with one tool provisionally named `qa_loop`.
An optional command may call the same service. Exact command names are open.
The parent agent resolves this contract from the request and project context:

| Input | Required meaning |
| --- | --- |
| Goal and target | QA scope, workspace, and product entry point. |
| Mode | `report` or `repair`, based on the user's authorization. |
| Acceptance | Required scenarios, expected behavior, project checks, and which confirmed defects block completion. |
| Constraints | Exclusions, existing user changes, environment and side-effect boundaries. |
| Models | Resolved lead and worker configurations. |
| Limits | Finite run, repair-attempt, and infrastructure-retry limits; exploration allowance and verification reserve. |

Use defaults and inferred context for routine choices. Ask only for missing input
that materially affects behavior or authorization. The word "QA" alone does not
grant unrestricted write authority. Report mode cannot dispatch product repairs;
checks and test-data interactions still obey the contract's side-effect limits.

At start, show a compact summary of target, scope, mode, models, completion
conditions, and limits. During execution, show what is being investigated,
repaired, or verified, plus verified and unresolved counts and blockers.
Detailed checks and evidence are available on demand; full child transcripts
should not flood the main conversation.

Start, status, cancel, and result inspection must work through the TUI. Identify
runs by stable IDs; inspecting a run must not start another. There is no MVP
resume action. The final report states the outcome and reason, tested source/build,
verified fixes, unresolved findings, coverage gaps, checks, local changes,
available usage information, and any required user action.

## 3. Roles and implementation boundaries

Use a small coordinator implemented in ordinary code. It owns dispatch, role and
mode checks, limits, result validation, saved state, cancellation, and completion
gates. An agent's claim of success cannot override those controls. No additional
manager model is needed.

The lead explores, reproduces findings, defines bounded repair tasks, and judges
verification. It does not repair product code in its verification role. It can
create verification artifacts in the run area. The worker investigates and edits
within the assigned scope, runs focused checks, and returns a proposed repair.
It cannot close findings, weaken acceptance, extend budgets, or delegate further.
Use tool restrictions where supported; do not describe prompt instructions alone
as enforced filesystem isolation. Task content cannot grant broader authority.

Use existing build, test, browser, native, or terminal tools. Only one agent may
drive a shared interactive surface at a time. Different sessions do not imply
separate filesystems or separate application state.

Keep the coordinator's policy testable independently of Pi rendering. Put child
session operations behind one small runtime adapter. Separate storage services,
a generic scheduler, and an extensive state-machine framework are not required.

Before coding, inspect the project and these upstream starting references:

- [Pi subagent example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent).
- [Pi SDK documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md).
- [Pi extension documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md).

These links are carried forward as inspection pointers, not a verified API
contract. Pin and test an actual Pi version. Choose one backend after checking
structured results, usage reporting, tool loading, and abort propagation.
Child sessions must load relevant project guidance, prevent recursive QA calls,
and use configured provider access without copying credentials into run records.

## 4. Core execution loop

1. **Prepare.** Resolve the contract, inspect existing changes, identify the
   source and running product, and establish a baseline with relevant cheap checks.
2. **Plan and discover.** Set a small required checklist from user goals and
   documented behavior. Exercise it and selected risky gaps within the exploration
   allowance. Separate reproducible defects from hypotheses, suggestions,
   duplicates, environment failures, and out-of-scope observations.
3. **Delegate.** In repair mode, assign one defect or a small related batch.
   Save the pending attempt before starting the worker.
4. **Repair.** The worker makes scoped changes and returns the candidate identity,
   changed files, checks, and limitations. Its result remains a proposal.
5. **Verify.** The lead replays the original failure, checks acceptance, and tests
   nearby affected behavior. Failed verification returns specific evidence for
   the next attempt, within the same limits.
6. **Continue or finish.** Complete remaining required coverage and useful bounded
   exploration. Before a repair pass, verify all required checks, required scenarios,
   and repaired scenarios on the final candidate. Report the outcome and gaps.

Report mode performs preparation, discovery, and reporting without a repair
worker. A completed report can contain defects; it does not claim they were fixed.

Required coverage and optional exploration are distinct. Fixing known issues
does not satisfy an untested required workflow. Additional exploration must not
silently expand the agreed repair scope or the required checklist. Do not repeat
a full exploratory session after every repair simply because another iteration
finished. Record changes to the contract; never lower it to manufacture a pass.

## 5. Repair and verification contracts

A worker handoff contains the goal, finding IDs, expected and observed behavior,
reproduction procedure and evidence, acceptance conditions, candidate identity,
edit boundaries, relevant code pointers, and previous attempts for those findings.
Give access to more source as needed without copying unrelated conversations.

A worker result contains the attempt ID, output candidate identity, changed files,
proposed fix, focused checks and their results, and remaining uncertainty.
Validate the result against the active run and attempt. Reject malformed, stale,
or late results; correcting a report must not blindly repeat edits.

Independent verification requires a lead-performed procedure and observed result
against the identified candidate. Worker logs and a diff can support diagnosis
but cannot replace replaying required behavior. Evidence records the procedure,
observation, verifier, target identity, and relevant artifact references.
Code validates provenance and gates; it cannot prove the lead interpreted a
screenshot or a product requirement correctly.

For example, if a new task disappears after reload, the repair handoff includes
the creation-and-reload reproduction. The lead must repeat that flow on the
repaired build and check relevant failure behavior, not just accept a passing
worker-written test.

Add regression tests when they capture a durable failure contract. Do not weaken
tests or fixtures to conceal failures; legitimate expectation changes need lead
review against product requirements and remain visible in the changes.

The MVP does not infer dependencies between code and old evidence. After source
changes, earlier verification remains historical evidence, not final-candidate
acceptance. Rerun required checks and required/repaired scenarios on the final
candidate. If that is unaffordable, report incomplete rather than reuse stale
results. Optional exploration observations retain the identity of their target.

Suggestion: replay the original symptom before reading the worker's explanation,
then inspect the diff and related risks. This may reduce anchoring without a third
agent; it does not guarantee independent reasoning.

## 6. Minimal saved state

Use one versioned structured run record with nested collections and separate
artifact files. The following information is required, not separate entities:

| Information | Minimum content |
| --- | --- |
| Run | ID, contract and changes to it, models/limits, activity, outcome/reason, timestamps, source/build baseline, usage completeness. |
| Checklist | Scenario ID, expected behavior and procedure, required/optional, result, tested candidate, evidence or gap reason. |
| Findings | ID, expected/observed behavior, reproduction, scope/severity, status, evidence, acceptance conditions, attempts and verification. |
| Attempts | ID, finding IDs, worker/session reference, input/output candidates, pending/completed marker, proposed changes, checks, failure reason, available usage. |
| Evidence | Procedure, observation, verifier/tool, timestamp, candidate identity, artifact reference where applicable. |

Checklist results distinguish pending, passed, failed, blocked, and skipped.
An older candidate's pass cannot satisfy final verification. Findings need only
open, proposed, verified, and dismissed statuses initially; failed verification
returns a finding to open. Uncertain findings remain labeled as such and are not
dispatched for speculative repairs. Dismissal needs a reason and supporting
investigation; deferring a confirmed defect leaves it unresolved. Merge duplicates
without losing evidence or resetting attempt counts.

Activity can be preparing, investigating, repairing, verifying, or finished.
Activity labels support display; acceptance is determined by evidence and gates,
not by reaching a particular label.

Save the record atomically before dispatch and after each material result,
including decisions needed after context compaction. Keep artifacts outside
tracked source by default. Use bounded references in agent messages; keep full
logs and large recordings outside them. Do not store credentials or unnecessary
sensitive test data. Event sourcing, separate evidence databases, and migration
frameworks are not required. Unreadable or unsupported records must be reported
as such and must never trigger automatic actions.

## 7. Workspace and target protection

Operate in the selected working copy with one QA writer and a recorded baseline.
Include existing user changes in the target; do not silently test committed HEAD
instead. Do not auto-stash, reset, clean, or roll back the user's work.

Record a source identity that includes uncommitted content, together with the
build/process and entry point being exercised. A Git commit alone is insufficient
for a dirty tree. Rebuild or restart when needed; a server or installed app from
another source cannot establish verification of the repair.

Before dispatch and acceptance, detect unexpected source changes and check target
ownership. Stop further writes and acceptance if ownership or source identity is
uncertain. Preserve the changes and report the conflict for inspection. Automatic
merging and reconciliation are not MVP requirements. Prevent conflicting QA runs
from writing to the same target; do not assume this prevents human edits.

The exact baseline/fingerprint mechanism is an implementation choice to validate
on supported environments. Non-Git repair is supported only if baseline copies,
identity, and preservation are verified; otherwise explain the limitation before
mutating. Automatic isolated workspaces are deferred.

## 8. Limits, failures, and interruption

Resolve finite wall-time, total repair-attempt, per-finding attempt, and
infrastructure-retry limits before execution. Exploration consumes the same run
budget and has a bounded allowance. Reserve capacity for verification and reporting;
do not start a repair when the remaining allowance cannot reasonably support them.
Stop new dispatches at a limit and attempt to stop active work at supported
boundaries. Model or tool latency can delay stopping; do not promise an exact
cost ceiling the backend cannot enforce.

Track available usage for both roles, including failed calls where reported.
Unknown usage is unknown, not zero. Token limits can supplement observable time
and attempt limits when supported. An unsupported strict user-requested monetary
cap is a configuration blocker. Numerical defaults remain open until evaluation.

Reassess repeated failures using their evidence. Useful progress means verified
behavior, completed coverage, or a new cause that changes the next repair—not
simply more edits. Suggested starting policy: reassess after two unsuccessful
attempts and stop that finding if there is no useful next diagnosis. Reusing or
replacing worker context within the run does not reset attempts or usage.
Automatic escalation chains are deferred.

| Event | Required MVP response |
| --- | --- |
| Cannot reproduce a finding | Record uncertainty; investigate within limits, without speculative repair. |
| Required behavior or acceptance is ambiguous | Save the reproduction and missing decision; finish incomplete with the required input. |
| Environment or required interaction tool unavailable | Record the baseline failure or blocked coverage; never present substituted checks as equivalent. |
| Worker output malformed or model unavailable | Allow bounded correction/retry where safe; otherwise finish with the reason. |
| Repair fails repeatedly or limits expire | Stop new work; report verified and unverified results as incomplete. |
| Unexpected edits or wrong running build | Stop writes and acceptance; preserve and explain the mismatch. |
| Cancellation | Stop dispatch, propagate abort to model and tool processes, save cancelled status and partial changes, and identify any child that could not be stopped. |
| Crash or interruption | Preserve the last saved record and pending attempt; show unfinished work as interrupted/incomplete, never automatically successful. |

Cancellation is terminal. Late results cannot revive a cancelled or finished run.
After a crash, an apparently active saved run is not evidence that its worker has
stopped. Inspect child processes and the working copy before permitting a new
writer. Preserve partial edits; do not automatically replay uncertain operations
or roll them back. A pending attempt indicates uncertainty, not failure or success.

The MVP supports inspection and manual recovery, not automatic continuation.
To continue later, establish what actually happened, check current instructions
and authorization, and create a new run with the previous record as context.
Retain previous attempts and blockers for diagnosis; do not silently restart
stalled work. The new run has explicit effective limits and cannot claim previous
evidence as current verification. Existing records remain available for inspection.

## 9. Completion gates

Outcomes are `passed`, `reported`, `incomplete`, `cancelled`, or `failed`, with a
specific reason. Use incomplete for unfinished scope, limits, missing input, or
unverified changes; failed for an unrecoverable runtime error.

A repair run passes only when:

- No confirmed in-scope defect blocks the agreed acceptance conditions.
- Every required scenario and project check passed on the final candidate.
- Every accepted repair has lead verification on that same candidate.
- No active worker, uncertain side effect, target mismatch, or unresolved
  external edit prevents acceptance.

Default suggestion: all confirmed in-scope defects block a pass. Any different
threshold or exclusion must be explicit in the contract; all unresolved findings
remain visible. The lead cannot silently skip a required check or defer a defect
to produce a passing result.

A report run is reported when the agreed investigation is complete, even if it
found defects. Blocked or skipped required coverage makes it incomplete.
Optional gaps are reported and do not independently block completion. Outcomes
describe the scoped work, not the absence of all bugs.

## 10. Implementation and acceptance plan

1. **Inspect and pin Pi.** Choose one child backend and prove result capture,
   relevant tool restrictions, usage visibility, and cancellation.
2. **Build the smallest complete flow.** One real reproducible defect, one repair
   worker, independent lead verification, and a saved report through the TUI.
   Include limits, cancellation, source identity, and preservation from the start;
   implement only the contracts needed for this flow.
3. **Compare early.** During that first milestone, run equivalent tasks with one
   strong agent and with lead plus worker. Use the results before expanding the
   orchestration or committing to a cheaper-worker default.
4. **Complete the MVP.** Add the remaining checklist, report-mode, final-candidate,
   and failure behavior specified here. Exercise them in the running TUI.
5. **Record evidence.** Update this specification with actual files, selected
   defaults, pinned version, supported environments, and limitations. Record
   completion evidence in the roadmap before describing Stage 2 as complete.

Meaningful automated checks must establish that worker claims cannot close a
finding, stale/missing evidence and blocked required coverage prevent passing,
report mode cannot dispatch repairs, attempts survive worker replacement and
context compaction, cancellation blocks later dispatch/results, and uncertain
edits after interruption are never blindly replayed. Test drift and wrong-build
detection. Use failure injection around saving, dispatch, edits, and result capture
to verify preservation and safe stopping, not automatic recovery.

Exercise start, progress, cancel, and result inspection in the actual TUI against
real targets. Include independently specified fixture defects: a simple local
bug, a user journey such as persistence, a regression caused by repair, and a
required scenario outside the initial findings. Cover dirty working copies and
non-Git targets if both are supported.

Compare equivalent snapshots, tasks, tools, and budgets with repeated trials.
Measure known defects discovered, false positives, independently verified repairs,
regressions, required coverage, user intervention, elapsed time, and available
usage/cost. Seeded-defect recall is not total real-world bug coverage. Stage 2
needs evidence of improved results or reduced intervention, with costs visible;
if delegation does not help, revisit the design before adding agents or machinery.

Open implementation choices: exact Pi backend/version, supported environments,
lead/worker models, numerical defaults, baseline mechanism, storage path, and tool
schema. Resolve these through a small runtime spike and evaluation. A stronger
lead with a capable cheaper worker is a hypothesis, not a required model ranking.
