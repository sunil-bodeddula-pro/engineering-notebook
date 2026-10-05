# Templates

Starting points for every kind of note, so each entry has the same shape and is quick to write.
Copy the block you need into a new file in the right folder.

| Template | Use for | Goes in |
| --- | --- | --- |
| [Log entry](#log-entry) | One line per learning session | Root `LEARNING.md` |
| [Note](#note) | A concept, lesson or article | Any topic folder's `notes/` or `fundamentals/` |
| [Algorithm problem](#algorithm-problem) | A solved problem | `algorithms/problems/` |
| [System design](#system-design) | An end-to-end design | `system-design/case-studies/` |
| [Language note](#language-note) | An idiom, internal or gotcha | `languages/<language>/` |
| [Tool comparison](#tool-comparison) | Two AI tools on the same task | `ai-engineering/comparisons/` |

---

## Log entry

~~~markdown
| 2026-10-05 | ai-engineering | Permissions: allow/ask/deny rules and scopes | [note](ai-engineering/notes/week-08-permissions.md) |
~~~

Columns: date · topic folder · what you learned in one line · link to the note.

## Note

~~~markdown
# <Title>

**Date:** YYYY-MM-DD · **Source:** <course / article / talk, with link>

## In one sentence
<The core idea.>

## Key points
-
-
-

## Example
<Code, diagram or worked example.>

## Why it matters / when to use it

## Open questions
~~~

## Algorithm problem

~~~markdown
# <Problem name> (<platform + link>)

**Pattern:** <e.g. sliding window> · **Difficulty:** <easy / medium / hard> · **Date:** YYYY-MM-DD

## The insight
<One or two sentences: why the solution works.>

## How to recognise it
<The clue in the problem statement.>

## Solution
```kotlin
// code
```

## Complexity
- Time: O(…) because …
- Space: O(…) because …

## Mistakes
<What you tried first and why it failed.>

## Revisit
- [ ] +1 week (YYYY-MM-DD)
- [ ] +1 month (YYYY-MM-DD)
~~~

## System design

~~~markdown
# Design: <system>

**Date:** YYYY-MM-DD

## 1. Requirements
- Functional:
- Non-functional (scale, latency, availability, consistency):
- Non-goals:

## 2. Estimates
Users, requests per second (read/write), storage per year, bandwidth.

## 3. API

## 4. Data model

## 5. High-level design
<Diagram and the main request path.>

## 6. Deep dives
<The 2–3 hardest parts: hot spots, consistency, failure handling.>

## 7. Trade-offs
| Choice | Alternative | Why this one | What would change it |
| --- | --- | --- | --- |
~~~

## Language note

~~~markdown
# <Language>: <topic>

**Date:** YYYY-MM-DD · **Version:** <language/runtime version>

## The rule / idiom

## Minimal example
```kotlin
// code
```

## Why it behaves this way

## Compared with <another language you know>

## Gotchas
~~~

## Tool comparison

~~~markdown
# <Task>: <Tool A> vs <Tool B>

**Date:** YYYY-MM-DD · **Versions:** <tool versions, models used>

## The task and spec
<Same spec given to both.>

| | <Tool A> | <Tool B> |
| --- | --- | --- |
| Time to done | | |
| Corrections needed | | |
| Diff quality (1–5) | | |
| Tests written / passing | | |
| Followed project instructions? | | |

## What differed

## Verdict / when to use which
~~~