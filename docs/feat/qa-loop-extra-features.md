# QA loop: extra feature candidates

Status: candidate designs, not implementation commitments. Updated: 2026-09-06.

The [MVP specification](qa-loop-mvp.md) is the complete implementation reference
for the initial QA loop. Nothing in this document is required to complete MVP or
Stage 2. These ideas preserve useful parts of the earlier broader design without
requiring a durable orchestration system before the core loop proves its value.

Read a candidate when measurements or user needs make its problem relevant.
Before implementation, define its supported behavior, verification criteria,
and roadmap scope. Adoption is a product decision, not an automatic consequence
of appearing here. No later stage or date is assigned.

## 1. Continuation after interruption and unattended operation

**Problem:** Interrupted runs may require substantial manual inspection and
repeated setup. Unattended use requires stronger lifecycle guarantees than the
MVP's saved progress and safe stopping.

**Possible design:** Resume by stable run ID after acquiring ownership and
checking for a live child. Reconcile pending actions against sessions, actual
files, and tool results before choosing another action. Revalidate the contract,
current authority, access, workspace, and running product. Preserve attempt and
usage counters across continuation; do not treat old permissions as unlimited.
Keep user cancellation distinct from resumable interruption.

A durable event log with sequence numbers and snapshots, or an equivalent local
store, could track action intent and results. Explicit schema compatibility and
partial-record handling would support recovery. Dispatch IDs help bookkeeping;
they do not make edits, submissions, or shell commands safe to replay. Preserve
uncertain side effects until their actual outcome is understood.

**Added complexity:** Child reconciliation, crash windows, compatibility, ownership
recovery, and policies for counters and authorization across sessions.

**Adoption trigger:** Measured interruption costs or an explicit unattended-use
need justify this machinery. Verify crashes before/after dispatch, edits, and
persistence, live orphan children, changed instructions, stale targets, and
duplicate-action prevention before promising continuation or unattended operation.

## 2. Focused fresh audit

**Problem:** A persistent lead can miss scenarios or become anchored on its first
interpretation even after all known repairs pass.

**Possible design:** One bounded audit near completion, focused on selected risky
gaps. Give an additional agent requirements and the current target without the
lead's repair narrative initially. It returns candidate findings; the lead
deduplicates, reproduces, and verifies them. Findings do not expand repair scope
or budgets automatically. Keep coverage and usage visible.

**Added complexity:** Another role/session, handoffs, duplicate handling, and a
new budget allocation. Fresh context does not guarantee independent reasoning.

**Adoption trigger:** Repeated comparisons against the MVP show enough additional
valid discoveries to justify time and cost. Include false positives and final
verified outcomes, not just the number of audit findings.

## 3. Selective reuse of verification evidence

**Problem:** Repeating required scenarios and repaired behaviors on the final
candidate may become a substantial part of runtime.

**Possible design:** Track scenario/check dependencies and source/build identity.
Invalidate potentially affected evidence after changes; retain prior verification
only with an explicit dependency rationale. When impact is uncertain, rerun.
Always honor the project's required final gates. Historical observations remain
distinguishable from acceptance evidence for the current target.

**Added complexity:** Dependency modeling, stale-evidence propagation, and the
risk of incorrectly accepting old evidence after a behavioral change.

**Adoption trigger:** Measurements show final verification is a significant cost,
and regression fixtures show reuse preserves acceptance correctness while reducing
work. Keep the MVP's final-candidate reruns until this is demonstrated.

## 4. Adaptive model routing and diagnosis escalation

**Problem:** A cheaper worker may cost more through repeated failed repairs;
difficult findings may benefit from a different model or a fresh diagnosis.

**Possible design:** Route bounded tasks by difficulty and observed failures.
Reuse useful context, replace stalled workers deliberately, and permit a bounded
escalation. Preserve finding identity, prior attempts, and total usage across
replacements. Model IDs and reasoning settings remain configuration rather than
a vendor ranking embedded in coordinator logic.

**Added complexity:** Routing policy, failure classification, more configurations,
and evaluation across models. This is separate from MVP's configurable model pair.

**Adoption trigger:** Comparisons show better verified outcomes or lower total cost
than a fixed pair. Include retries and verification, not only worker token prices.

## 5. Isolated workspaces and integration

**Problem:** Some users need QA repairs separated from an actively edited working
copy, or external edits cause frequent stops.

**Possible design:** Explicit snapshots or worktrees that include the intended
uncommitted changes. Identify the source/build actually tested and show where
repairs live. Define integration and conflict handling separately; verification
of an isolated candidate does not automatically verify a later merged result.

**Added complexity:** Snapshot inclusion, dependency setup, separate app processes,
safe integration, and user-change preservation. Isolation does not by itself
authorize parallel writers, automatic merging, or publication.

**Adoption trigger:** Concrete isolation needs or measured drift interruptions
outweigh setup costs. Test dirty-tree inclusion, wrong-server detection, conflicts,
and verification after integration before offering the capability.

## 6. Richer storage and usage controls

**Problem:** A single run record may become cumbersome for long histories, large
artifact collections, or queries across runs. More precise cost controls may be
useful when provider accounting supports them.

**Possible design:** Split run, scenario, finding, attempt, verification, and
evidence records only as needed. Add indexed artifacts, event history, and explicit
schema evolution. Track per-role usage, retries, and caching where reported;
support more detailed reservations if the backend can enforce them.

**Added complexity:** Storage relationships, migrations, retention, incomplete
accounting, and reconciliation of delayed billing. Unknown usage must remain
unknown. An estimated price is not an enforceable hard monetary ceiling.

**Adoption trigger:** Measured record size, inspection/recovery needs, or reliable
provider capabilities establish a concrete benefit. Validate crash safety,
compatibility, and accounting limits before replacing the MVP's simple record.

## Decision rationale to retain

- Discovery and repair verification solve different problems; a clean issue list
  does not show that untested workflows work.
- Acceptance belongs to the lead; worker confidence is not independent evidence.
- The value of model routing and extra agents must be measured, including retries.
- Code controls authority, limits, and acceptance; prompts alone cannot enforce them.
- Saved records preserve important context, but continuity does not require
  automatic continuation in the initial release.
- The interface stays small and optional as capabilities grow.
