# QA loop

Status: planned feature; not implemented. Updated: 2026-09-06.

## Overview

The QA loop is an optional Intentum tool. A QA lead investigates a product,
delegates bounded repairs to a worker, and independently verifies the result.
The run tracks required coverage, respects authorization and finite limits,
and reports verified fixes, unresolved findings, and gaps. It never guarantees
a bug-free product.

The initial design is a supervised, usable loop with one target workspace,
one lead, and one active repair worker. Users can start, follow, cancel, and
inspect runs through the TUI. Saved progress supports inspection after
interruption; automatic continuation is outside the MVP.

## Design documents

- **[QA-loop MVP](qa-loop-mvp.md):** The implementation reference for the initial
  scope, including behavior, minimal contracts, failure handling, and acceptance.
  Read this before implementing or changing the core loop.
- **[QA-loop extra features](qa-loop-extra-features.md):** Candidate extensions,
  their trade-offs, and evidence that would justify adopting them. Read relevant
  sections when evaluating an extension. They are not MVP requirements or
  promised future features.

The design was split to prove the core loop before expanding orchestration,
recovery, and optimization. The MVP is self-contained; this page only introduces
and links the specifications. The [roadmap](../roadmap.md) owns sequencing and
stage completion, and the [vision](../vision.md) owns product principles.
