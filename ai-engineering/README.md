# AI Engineering

Learning to **use AI tools well** — in product development, tool integrations, plugins, skills,
automation and security — and to lead a team's adoption of them. The theory of how models work is
kept to the basics; the depth goes into practice.

## Start here

**[AI-Engineering-Leadership-Roadmap.md](AI-Engineering-Leadership-Roadmap.md)** — the main document, in two parts:

| Part | What it is |
| --- | --- |
| **A — 26-week roadmap** | 30 minutes a day across six phases: AI basics, AI-assisted development, mastering the tools, building AI features, agents/MCP/skills you build, and security/evals/cost |
| **B — Practitioner's handbook** | Step-by-step playbooks B1–B13: product development with an agent, instructions and memory, MCP integrations, plugins, skills, subagents and hooks, automation, security, cost, troubleshooting, a cross-tool cheat sheet and a real-repo case study |

`AI-Engineering-Leadership-Roadmap.original.md` is the first draft, kept for reference.

## What belongs here

- Notes from each week of the roadmap (course lessons, articles, release notes)
- Comparisons between tools on the same task (Claude Code vs Gemini CLI vs Copilot vs Cursor vs Codex)
- Working examples you build: `AGENTS.md`, `SKILL.md` skills, settings and permission files, hooks, MCP servers
- Explainers written for the team ("LLM basics", AI coding rules, the security checklist)
- Eval sets and results for AI features

## Layout (grows as you go)

```
ai-engineering/
├── AI-Engineering-Leadership-Roadmap.md   ← the plan and the handbook
├── notes/        ← one file per topic or week, e.g. notes/week-08-permissions.md
├── comparisons/  ← tool-vs-tool results on the same task
├── examples/     ← AGENTS.md, skills, settings.json, hooks, MCP servers you have built
└── team/         ← explainers and checklists written to share
```

## How to add an entry

1. Log it in the root `LEARNING.md` (date · topic · one line · link).
2. Put the distilled note in `notes/`, using the note template in [`templates/`](../templates/).
3. If you built something reusable, put it in `examples/` with a two-line README saying what it does and which tools it was tested in.
4. Tool details change monthly: write the **date** and the **tool version** on anything tool-specific.

## Progress

| Phase | Weeks | Status |
| --- | --- | --- |
| 1 — The basics of how AI works | 1–2 | Not started |
| 2 — AI-assisted development | 3–7 | Not started |
| 3 — Mastering the tools | 8–13 | Not started |
| 4 — Building AI features into products | 14–17 | Not started |
| 5 — Agents, MCP servers and skills you build | 18–21 | Not started |
| 6 — Security, evals, cost and production | 22–26 | Not started |
