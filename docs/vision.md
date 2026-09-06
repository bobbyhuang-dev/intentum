# Intentum: vision and development principles

## Purpose

Intentum is a customized Pi agent. It extends the original Pi agent with features
intended to save time, save energy, and improve the quality of generated code.
The goal is to help developers ship high-quality products quickly and easily.

This document describes Intentum's intended direction and the principles for
building it. It is not an inventory of implemented features.

The [roadmap](roadmap.md) records the agreed stage scope, sequencing, and
completion criteria.

## Core philosophy

### A toolbox, not a prescribed workflow

Intentum should be a well-configured toolbox that developers use to their
advantage, rather than a workflow they must strictly follow.

The adaptive [QA loop](feat/qa-loop.md#overview) is Intentum's first planned tool.
A UI designer is another example of a possible future tool, not an implementation
commitment.

Tools can have their own steps and verification requirements without forcing
every developer or task through one universal process. The developer should be
able to choose the capabilities that serve their work.

### Direct, lightweight, and understandable

Intentum should not be confusing. In alignment with Pi's philosophy, the
experience should remain direct and easy to follow, rather than feeling heavy
or complex.

Evaluate added capability alongside the effort needed to understand and use it.
A feature should help developers, not require them to manage unnecessary process
or complexity.

## Development principles

These principles guide feature design and implementation. Explicit requirements
and authorization boundaries remain constraints; examples and suggested methods
are not mandatory implementations.

### 1. Avoid reinventing the wheel

Study existing tools and their architecture and design before building an
equivalent capability. Learning from existing work can both save time and lead
to a better product. Stand on the shoulders of giants.

### 2. Define what “done” means

Give the agent a clear outcome and a way to verify it. Make clear whether
completion includes implementation, testing, inspection, delivery, or deployment.
Do not assume that authorization for one includes all the others.

### 3. Keep instructions focused

Every instruction should provide necessary knowledge, express a requirement, or
address a demonstrated failure. Remove duplicates, contradictions, and rules
that no longer serve a purpose.

### 4. Separate requirements from suggestions

Make mandatory constraints easy to identify. Give the agent flexibility over
methods when the method does not affect correctness or safety.

### 5. Provide context when it becomes relevant

Keep essential facts and constraints readily available. Load detailed references
for the tasks that need them, with clear directions for finding more information.
The short project-root `AGENTS.md` and this deeper document implement that split.

### 6. Make tools easy to use correctly

Give tools clear names, specific inputs, and understandable results. Errors
should explain what failed and whether the agent can recover.

### 7. Give each skill a clear purpose

Explain when to use a skill and where its scope ends. Avoid overlapping
descriptions that cause unrelated skills to activate.

### 8. Preserve progress across interruptions

Keep track of the goal, decisions, completed work, permissions, and remaining
work. The agent should resume without repeating actions or losing newer
instructions. Preserve the scope of permissions, not an assumption of indefinite
authorization.

### 9. Design for failure and recovery

Make failed actions visible and provide a recovery path. Before retrying an
action with side effects, check whether the previous attempt already succeeded.

### 10. Give persistence a stopping rule

Continue until the agreed outcome is reached. Stop when required input is
missing, authorization ends, or further attempts are no longer making useful
progress.

### 11. Make important decisions traceable

The agent should explain consequential assumptions, approval requests, and
blockers. Distinguish what it attempted from what it verified. Preserve
significant agreed decisions and their rationale in project documentation so
future sessions can understand them.

### 12. Test the harness when changing it

Compare changes on representative tasks. Measure correctness, completion,
unnecessary interruptions, time, and cost. Keep a change because it improves
results, not simply because it shortens the prompt.

### 13. Let the agent finish authorized work

Allow routine investigation, edits, and fixes without repeated confirmation.
When approval is needed, have the agent prepare a concrete result for review
first where possible, without performing the action that requires approval.

### 14. Check that the change works

Check related behavior when the change could affect it. Stop checking once there
is enough evidence and the required checks have been completed.

## Using and maintaining this guidance

Use these principles when assessing features, tool and skill interfaces, agent
instructions, harness changes, and product trade-offs. Consider both the result
for the developer and the complexity the change introduces.

Keep `AGENTS.md` concise and retain the full explanation here. Update both when
an agreed change in direction affects their contents. Keep speculative ideas
separate from accepted decisions, and intended behavior separate from verified
implementation status.
