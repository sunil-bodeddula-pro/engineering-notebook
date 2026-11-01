---
name: spec-driven-development
description: Runs a spec-driven development workflow for a new feature or a change to an existing one. Writes spec.md (user stories, EARS acceptance criteria, open questions), then plan.md, then tasks.md, checks they agree, and implements task by task until every acceptance test passes. Use when the user asks for a spec, requirements, acceptance criteria, a feature plan or task breakdown, mentions spec-driven development or SDD, or describes a feature with business rules and edge cases.
compatibility: Works with any coding agent that supports Agent Skills. Needs to read and write files in the repository and run the project's tests.
metadata:
  author: interviewkata.com
  version: "1.0"
---

# Spec-driven development

Write and agree the spec before any code. The spec says what and why; the plan says how; the tasks say in what order. The spec is the source of truth: every change starts there.

## Choose the weight first

- **Skip SDD** for typos, one-line fixes and pure refactors. Fix it, with a test if behaviour matters.
- **Quick spec** (spec.md with acceptance criteria, then tasks) for small, well-understood features.
- **Full workflow** (all steps below) for features with business rules, several people or agents, unfamiliar code, or anything auditable such as money, auth or personal data.

Tell the user which weight you chose and why, in one sentence.

## Workflow

Copy this checklist into your response and tick it off as you go:

```
SDD progress:
- [ ] 1. Read the rules (constitution / AGENTS.md)
- [ ] 2. Specify: spec.md
- [ ] 3. Clarify: no open questions left        ← STOP for the user
- [ ] 4. Plan: plan.md, constitution check      ← STOP for the user
- [ ] 5. Tasks: tasks.md
- [ ] 6. Analyze: spec ↔ plan ↔ tasks agree
- [ ] 7. Implement task by task, tests first
- [ ] 8. Converge: every acceptance test passes
- [ ] 9. Report: what was built, against the spec
```

Files live in `specs/NNN-short-name/` (for example `specs/014-discount-codes/`), next to the code and committed with it.

### 1. Read the rules

Read `specs/constitution.md` if it exists, otherwise AGENTS.md (or the agent's own instruction file). List the rules that apply to this feature. If there is no constitution and the feature is non-trivial, propose three to seven project rules and ask the user to confirm them.

### 2. Specify

Write `spec.md` using the template below. Rules:

- No technology choices: no frameworks, tables, endpoints or libraries. Those go in the plan.
- Order user stories by priority. P1 alone must be a usable result.
- Write every functional requirement as one EARS sentence (see "EARS patterns"), with numbers and exact messages, never "fast", "appropriate" or "user-friendly".
- Never guess. Mark each unknown as `[NEEDS CLARIFICATION: question? options: A / B]`. Keep at most five; if there are more, ask the user to narrow the scope.
- List what is out of scope. It stops the agent building extra features.

### 3. Clarify (stop and ask)

Ask the user every `[NEEDS CLARIFICATION]` question in one message, each with your recommended option. Record the answers in a `## Clarifications` section with the date, update the requirements, and remove the markers. Do not continue to the plan while any marker remains.

### 4. Plan (stop and ask)

Write `plan.md`: technical context (language, dependencies, storage, testing), data model, interfaces or API contracts, components, risks, and a **constitution check** table listing each rule and whether the plan complies. Any violation needs a written justification and the simpler alternative that was rejected. Ask the user to approve the plan before writing tasks.

### 5. Tasks

Write `tasks.md` as a checklist, in phases: setup, foundational, one phase per user story in priority order, then polish. Each line:

```
- [ ] T005 [P] [US1] Short description, exact file path (FR-001, FR-003)
```

- `[P]` only when the task touches different files from other open tasks and depends on nothing unfinished.
- Tests come before the code they test, and must fail first.
- End each user story with a checkpoint: the story works on its own.

### 6. Analyze

Before writing code, check the three files agree. Fix every problem, then re-check:

- Every FR and every acceptance scenario has at least one task and one test.
- Every task points to a requirement; remove tasks that do not.
- No technology in the spec; no requirement in the plan that the spec lacks.
- No conflicts with the constitution; no `[NEEDS CLARIFICATION]` left.
- Terms are used consistently across the three files.

Report the result as a short table: check, status, fix made.

### 7. Implement

One task at a time, in order. For each: write or update the test, see it fail, write the code, run the project's checks (types, lint, tests), tick the task in tasks.md. Do not edit tests, lint rules or CI configuration to make a check pass. If the spec turns out wrong or incomplete, stop and propose a spec change instead of improvising.

### 8. Converge

Run the full acceptance test set for the feature. If anything fails, find the open or wrong task, fix it, and run again. Ticked boxes are not the goal; every acceptance test passing is. Stop after three loops without progress and report what is blocking.

### 9. Report

Summarise against the spec: each user story and FR with its status and the test that proves it, anything deferred, and any spec changes made along the way.

## Changing a feature later

Change the spec first, then the plan, tasks, tests and code, in the same pull request. Describe the change as a delta at the top of spec.md:

```
## Changes
- 2026-11-03 ADDED FR-009: per-customer limit (reason: abuse report #812)
- 2026-11-03 MODIFIED FR-004: minimum order 20.00 → 25.00
```

## EARS patterns

| Pattern | Template |
|---|---|
| Ubiquitous | The <system> shall <response>. |
| Event | WHEN <trigger>, the <system> shall <response>. |
| State | WHILE <state>, the <system> shall <response>. |
| Optional feature | WHERE <feature is enabled>, the <system> shall <response>. |
| Unwanted behaviour | IF <unwanted condition>, THEN the <system> shall <response>. |

One trigger and one observable response per sentence, so each turns directly into a test.

## spec.md template

```markdown
# Feature: <name>
Status: Draft | Clarified | Approved    Spec: specs/NNN-short-name/

## User stories
### US1 (P1): <title>
As a <user>, I want <goal>, so that <value>.
Independent test: <how to check this story alone>
Acceptance scenarios:
1. Given <state>, when <action>, then <outcome>.

### US2 (P2): <title>
...

## Functional requirements (EARS)
- FR-001 WHEN <trigger>, the <system> shall <response>.
- FR-002 IF <unwanted condition>, THEN the <system> shall <response>.
- FR-003 [NEEDS CLARIFICATION: <question>? options: A / B]

## Edge cases
- <boundary or error case and the expected behaviour>

## Key entities (no implementation details)
- <Entity>: <purpose, key attributes, relationships>

## Success criteria (measurable, technology-agnostic)
- SC-001 <metric and target>

## Out of scope
- <what this feature will not do>

## Clarifications
- <date> Q: <question> → A: <answer>
```

## plan.md template

```markdown
# Plan: <name>
Spec: specs/NNN-short-name/spec.md

## Technical context
Language / dependencies / storage / testing / constraints

## Constitution check
| Rule | Complies? | Notes |
|---|---|---|

## Data model
## Interfaces and contracts
## Components and changes per file
## Risks and mitigations
## Complexity tracking (only for justified rule violations)
| Violation | Why needed | Simpler alternative rejected because |
```

## Example requirement set

For "discount codes at checkout":

```
FR-001 WHEN a customer enters a valid, active code, the checkout service shall apply its discount to the eligible items and show the new total.
FR-002 IF the code has expired, THEN the checkout service shall reject it and show "This code expired on <date>".
FR-003 WHILE the cart contains a gift card, the checkout service shall exclude the gift card from the discount.
FR-004 WHERE the customer has a loyalty account, the checkout service shall apply the loyalty discount after the code discount.
FR-005 The checkout service shall never reduce an order total below 0.00.
```
