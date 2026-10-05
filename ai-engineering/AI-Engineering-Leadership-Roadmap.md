# AI Engineering Leadership Roadmap

Oct 4, 2026 · Your first version is kept unchanged in `AI-Engineering-Leadership-Roadmap.original.md`.

This document has two parts:

- **Part A — The 26-week roadmap.** What to learn each week, 30 minutes a day. The theory of how models work is **kept to the basics** (two weeks); most of the time goes on **using AI tools well**.
- **Part B — The practitioner's handbook.** Deep, step-by-step playbooks for real situations: building a product, connecting tools, installing plugins, writing skills, automating, and securing all of it. Each roadmap week points to the playbook it practises.

> **Tool details change monthly.** Commands and file names below are correct for Claude Code, Gemini CLI, GitHub Copilot, Cursor and Codex as of October 2026. Confirm them in each tool's docs before you roll them out. The *concepts* behind them change slowly.

---

## Contents

**Part A — Roadmap**
1. [How to use this roadmap](#how-to-use-this-roadmap)
2. [The portable skill stack](#the-portable-skill-stack)
3. [Daily learning system](#daily-learning-system)
4. [Phase 1 — The basics of how AI works (weeks 1–2)](#phase-1--the-basics-of-how-ai-works-weeks-12)
5. [Phase 2 — AI-assisted development (weeks 3–7)](#phase-2--ai-assisted-development-weeks-37)
6. [Phase 3 — Mastering the tools: configure, integrate, extend (weeks 8–13)](#phase-3--mastering-the-tools-configure-integrate-extend-weeks-813)
7. [Phase 4 — Building AI features into products (weeks 14–17)](#phase-4--building-ai-features-into-products-weeks-1417)
8. [Phase 5 — Agents, MCP servers and skills you build (weeks 18–21)](#phase-5--agents-mcp-servers-and-skills-you-build-weeks-1821)
9. [Phase 6 — Security, evals, cost and production (weeks 22–26)](#phase-6--security-evals-cost-and-production-weeks-2226)
10. [Leading the team](#leading-the-team)
11. [Staying current after week 26](#staying-current-after-week-26)

**Part B — Handbook**

- [B1. The mental model: what you are actually configuring](#b1-the-mental-model-what-you-are-actually-configuring)
- [B2. Playbook: product development with an AI agent](#b2-playbook-product-development-with-an-ai-agent)
- [B3. Playbook: project instructions and memory](#b3-playbook-project-instructions-and-memory)
- [B4. Playbook: tool integrations with MCP](#b4-playbook-tool-integrations-with-mcp)
- [B5. Playbook: installing and governing plugins and extensions](#b5-playbook-installing-and-governing-plugins-and-extensions)
- [B6. Playbook: developing skills](#b6-playbook-developing-skills)
- [B7. Playbook: subagents, hooks and custom commands](#b7-playbook-subagents-hooks-and-custom-commands)
- [B8. Playbook: automation — headless runs, CI and scheduled agents](#b8-playbook-automation--headless-runs-ci-and-scheduled-agents)
- [B9. Playbook: enhancing security](#b9-playbook-enhancing-security)
- [B10. Playbook: context, cost and speed](#b10-playbook-context-cost-and-speed)
- [B11. Playbook: when the agent goes wrong](#b11-playbook-when-the-agent-goes-wrong)
- [B12. Cross-tool cheat sheet](#b12-cross-tool-cheat-sheet)
- [B13. Case study: a real repository set up for agents](#b13-case-study-a-real-repository-set-up-for-agents)
- [Course library](#course-library)

---

# Part A — The 26-week roadmap

## How to use this roadmap

A 26-week, 30-minutes-a-day plan that takes you from "some experience" to the person your team asks about AI tooling. It is tool-agnostic: you learn the concepts and open standards once, then apply them in Claude, Gemini / Antigravity, GitHub Copilot, Cursor, Codex or whatever ships next.

- **Learn the layer below the tool.** Models, context, tools, agents and evals work the same way everywhere. Tool UIs change monthly; these concepts change yearly.
- **Practise every concept in two tools.** For each weekly exercise, do it in one Anthropic tool and one Google tool (for example Claude Code and Antigravity / Gemini CLI). Noting what differs is how you become the team's guide.
- **Ship into a real codebase.** Use your own project (the Angular + Kotlin repo) as the practice ground, so every lesson produces something reusable for the team.
- **Teach weekly.** A 15-minute share-out each Friday locks in learning and seeds the team rollout (see [Leading the team](#leading-the-team)).
- **Use Part B as you go.** Each phase lists the handbook playbooks it practises. Read the playbook on Monday, apply it Tuesday–Wednesday.

## The portable skill stack

Three open standards make most of your work portable across vendors, so learn these first and the tool-specific parts become small.

| Standard | What it does | Who reads it | Learn it in |
| --- | --- | --- | --- |
| [AGENTS.md](https://agents.md) | One Markdown file in the repo root with build/test commands, conventions and boundaries for coding agents | Codex, Cursor, Copilot, Gemini CLI, Windsurf and more; Claude Code reads CLAUDE.md, so import or symlink it ([guide](https://www.eesel.ai/blog/claude-code-agents-md)) | Phase 2, [B3](#b3-playbook-project-instructions-and-memory) |
| [Agent Skills (SKILL.md)](https://agentskills.io) | A folder of instructions + scripts an agent loads on demand for a specific task | Released by Anthropic as an open standard in Dec 2025; adopted by Codex, Gemini CLI, Copilot, Cursor, VS Code, Antigravity and 20+ others ([overview](https://www.firecrawl.dev/blog/agent-skills)) | Phase 3, [B6](#b6-playbook-developing-skills) |
| [MCP (Model Context Protocol)](https://modelcontextprotocol.io) | A standard way to plug tools and data sources (Jira, databases, GitHub, your APIs) into any AI client | Claude, Gemini, Copilot, Cursor, Antigravity, Codex and most agent frameworks | Phase 3, [B4](#b4-playbook-tool-integrations-with-mcp) |

Under those standards sit the concepts that never depend on a vendor:

| Layer | Concepts to master | Same idea in Claude vs Gemini / Antigravity |
| --- | --- | --- |
| Model | Tokens, context window, reasoning modes, model tiers (fast vs smart) | Haiku / Sonnet / Opus vs Flash / Pro |
| Context | Prompt structure, examples, project instructions, memory, context engineering | CLAUDE.md vs GEMINI.md, both via AGENTS.md |
| Tools | Function calling, structured JSON output, MCP servers | Tool use API vs function calling API; MCP in both |
| Agents | Plan → act → observe loop, subagents, human approval, guardrails | Claude Code subagents vs Antigravity Agent Manager |
| Extension | Skills, plugins/extensions, hooks, custom commands | Claude Code plugins vs Gemini CLI extensions |
| Quality | Evals, error analysis, LLM-as-judge, tracing | Vendor-neutral (your own test sets) |
| Safety and cost | Prompt injection, permissions, sandboxing, secrets, data privacy, token cost | Same risks everywhere |

Rule of thumb for the team: **put knowledge in AGENTS.md, skills and MCP servers, not in one tool's settings.** Then switching tools costs a day, not a quarter.

## Daily learning system

Thirty minutes a day, five days a week, with a fixed theme per day so you never waste time deciding what to learn.

| Day | Theme (30 min) | Output |
| --- | --- | --- |
| Monday | **Watch / read:** one lesson from the current phase, or the linked Part B playbook | 3 bullet notes in your learning log |
| Tuesday | **Build:** apply Monday's idea in your project with tool A (e.g. Claude Code) | A commit, a config file or a saved prompt |
| Wednesday | **Cross-check:** repeat the same task with tool B (e.g. Antigravity / Gemini CLI) | One line: what differed, which was better |
| Thursday | **Read:** release notes or one article from the [Staying current](#staying-current-after-week-26) list | One thing that changed this week |
| Friday | **Teach:** 15-minute share-out to the team, and update AGENTS.md / skills | A team-visible artifact |

Weekend (optional, 1–2 hours): a longer course module or a mini-project from the current phase.

Keep a single learning log (a repo `LEARNING.md` works well) with date, what you learned, and a link. After 26 weeks it becomes your team on-boarding guide.

## Phase 1 — The basics of how AI works (weeks 1–2)

Goal: enough understanding to explain to any engineer **why** a model hallucinates, why context size matters, why the same prompt behaves differently across models, and why an agent can be tricked by text it reads. No maths required.

| Week | Focus | Resource |
| --- | --- | --- |
| 1 | What an LLM is: tokens, next-token prediction, training vs fine-tuning, context window, why it "makes things up" | [Andrej Karpathy — Intro to Large Language Models](https://www.youtube.com/@AndrejKarpathy) (1 hour) and the first hour of [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) |
| 2 | Using LLMs well: reasoning modes, model tiers, tool use, what agents are | Karpathy — *How I use LLMs* (on his channel); [3Blue1Brown — transformers and attention chapters](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) only if you want the intuition |

**The ten ideas you must be able to explain after Phase 1:**

1. **Tokens.** Models read and write chunks of text (~¾ of a word each). Price, speed and limits are all counted in tokens.
2. **Context window.** Everything the model "knows" in the moment — instructions, files, conversation, tool results — must fit in it. Outside it, the model knows nothing.
3. **Next-token prediction.** The model produces the most plausible continuation. Plausible is not the same as true, which is why it hallucinates.
4. **Training cutoff.** It knows the world up to a date. Anything newer must be given to it (search, docs, files).
5. **Reasoning ("thinking") modes.** Spending more tokens on reasoning first improves hard tasks, at the cost of time and money.
6. **Model tiers.** Fast/cheap models for simple, high-volume work; large models for hard reasoning. Picking the tier is a cost decision.
7. **Instructions vs data.** A model cannot reliably tell your instructions apart from instructions hidden in a file, web page or tool output. This single fact is the root of **prompt injection** ([B9](#b9-playbook-enhancing-security)).
8. **Tools.** A model cannot *do* anything by itself. It asks the host program to run a tool (read a file, run a command, call an API) and reads the result.
9. **Agents.** A loop: plan → call a tool → read the result → decide the next step, until done. Most "AI coding tools" are agents.
10. **Non-determinism.** The same prompt can give different answers. You judge quality with **evals** (test sets), not single examples.

Practice:

- [ ] Write a one-page "LLM basics for our team" explainer covering the ten ideas above
- [ ] Run the same 5 prompts in Claude and Gemini; log differences in tone, accuracy and refusal
- [ ] Estimate the token cost of one feature idea in your app using both vendors' pricing pages

> **Optional deep track (not required):** [Karpathy — Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) builds a GPT from scratch in 30+ hours. Worth it only if you want to go below the basics; it is not needed to lead AI tool adoption.

## Phase 2 — AI-assisted development (weeks 3–7)

Goal: one workflow your whole team can use in any coding agent — explore, plan, implement, test, review — driven by a shared AGENTS.md.

Playbooks practised: [B2](#b2-playbook-product-development-with-an-ai-agent), [B3](#b3-playbook-project-instructions-and-memory), [B11](#b11-playbook-when-the-agent-goes-wrong).

| Week | Focus | Resource |
| --- | --- | --- |
| 3 | Prompting and context engineering: goal, context, constraints, examples, output format, definition of done | [Anthropic Academy](https://anthropic.skilljar.com) prompt engineering course + Google's Gen AI Intensive Day 1 ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-genai)) |
| 4 | Agentic coding tool #1: Claude Code (terminal + IDE): plan mode, permissions, checkpoints | Anthropic Academy *Claude Code in Action* + Claude Code docs (docs.claude.com) |
| 5 | Agentic coding tool #2: Antigravity / Gemini CLI | [Antigravity tutorial for beginners](https://www.youtube.com/watch?v=1Q5sWISByuw), [Editor vs Agent Manager overview](https://www.youtube.com/watch?v=LroJ8KEiTo4), [Gemini CLI repo docs](https://github.com/google-gemini/gemini-cli) |
| 6 | Shared instructions: AGENTS.md, CLAUDE.md, GEMINI.md, Copilot instructions, Cursor rules | [agents.md](https://agents.md) + [B3](#b3-playbook-project-instructions-and-memory) |
| 7 | The team workflow end to end on a real feature: spec → plan → small diffs → tests → AI review → human review | Practice week, following [B2](#b2-playbook-product-development-with-an-ai-agent) |

Practice:

- [ ] Write an AGENTS.md for your repo (commands, folder map, conventions, "never touch" list); import it from CLAUDE.md and GEMINI.md
- [ ] Implement the same small feature in Claude Code and Antigravity from the same spec; compare diff quality, time and how often you had to correct it
- [ ] Draft a team "AI coding rules" page: when to use agents, review requirements, what not to paste (secrets, customer data)

## Phase 3 — Mastering the tools: configure, integrate, extend (weeks 8–13)

Goal: you can set up a coding agent for a team the way a senior engineer sets up a build system — integrations, plugins, skills, subagents, hooks and automation — securely and reproducibly, checked into the repo.

Playbooks practised: [B4](#b4-playbook-tool-integrations-with-mcp) – [B8](#b8-playbook-automation--headless-runs-ci-and-scheduled-agents), [B12](#b12-cross-tool-cheat-sheet).

| Week | Focus | Exercise |
| --- | --- | --- |
| 8 | Settings and permissions: allow / ask / deny rules, project vs user vs local settings | Commit a `.claude/settings.json` with a safe allowlist for your repo's test and build commands, and a deny list for secrets ([B9](#b9-playbook-enhancing-security)) |
| 9 | Tool integrations with MCP: GitHub, issue tracker, database (read-only), browser | Connect 3 MCP servers at **project scope**; use them for a real task ([B4](#b4-playbook-tool-integrations-with-mcp)) |
| 10 | Plugins and extensions: marketplaces, what a plugin bundles, reviewing before installing | Install one plugin in Claude Code and one extension in Gemini CLI; read every file they add first ([B5](#b5-playbook-installing-and-governing-plugins-and-extensions)) |
| 11 | Skills: writing, triggering and testing SKILL.md | Write 2 skills from your team's real repetitive tasks; test triggering in two agents ([B6](#b6-playbook-developing-skills)) |
| 12 | Subagents, hooks and custom commands | A `security-reviewer` subagent, a formatting hook and a `/review-pr` command ([B7](#b7-playbook-subagents-hooks-and-custom-commands)) |
| 13 | Automation: headless runs, CI, scheduled agents | An agent that reviews every PR in CI with read-only permissions ([B8](#b8-playbook-automation--headless-runs-ci-and-scheduled-agents)) |

Practice:

- [ ] All agent configuration for your repo lives in version control (`AGENTS.md`, `.claude/`, `.mcp.json`, `.gemini/`), reviewed like code
- [ ] A new teammate can clone the repo and have the same agent setup in under 10 minutes
- [ ] One page per tool on your wiki: "how our team configures it, and why"

## Phase 4 — Building AI features into products (weeks 14–17)

Goal: ship one AI feature behind a provider-agnostic interface, so the team can swap Claude and Gemini by config.

| Week | Focus | Resource |
| --- | --- | --- |
| 14 | Calling model APIs: messages, streaming, system prompts, structured JSON output | Anthropic Academy API course + Gemini API quickstarts; compare both side by side |
| 15 | Tool / function calling inside your product | Google Agents Intensive Day 2 (tools) ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-agents)) |
| 16 | Embeddings, vector search and RAG: chunking, retrieval, reranking, citing sources | Google Gen AI Intensive Day 2 + [Mastering LLMs open course](https://hamel.dev/blog/posts/course/) RAG talks |
| 17 | Provider abstraction, fallbacks, timeouts, cost limits | Practice week |

Practice (ideas from your batch and expiration tracker):

- [ ] "Ask your inventory": natural-language questions over stock data using tool calling ("what expires this week in dairy?")
- [ ] Parse supplier invoices or labels into structured JSON (batch number, expiry date) with schema validation
- [ ] Put both behind one `LlmProvider` interface with Claude and Gemini adapters; switch via environment config

**Product rules for any AI feature** (agree them before building):

- The model **suggests**, a person or deterministic code **decides** anything with money, safety or compliance consequences.
- Every output that becomes data is **validated against a schema**; invalid output is retried once, then refused, never stored.
- Untrusted input (supplier PDFs, customer text) is treated as **data, never instructions**, and the feature has no tools that can leak or delete ([B9](#b9-playbook-enhancing-security)).
- Each feature has an **eval set** before launch and a **cost ceiling** per tenant ([B10](#b10-playbook-context-cost-and-speed)).

## Phase 5 — Agents, MCP servers and skills you build (weeks 18–21)

Goal: build reusable team capabilities — your own MCP server and a skills library — that work in Claude, Antigravity, Gemini CLI, Copilot and Cursor unchanged.

| Week | Focus | Resource |
| --- | --- | --- |
| 18 | Agent fundamentals: loops, planning, memory, multi-agent | [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course) |
| 19 | MCP concepts and building a server | [Hugging Face MCP Course](https://huggingface.co/learn/mcp-course) ([intro video](https://www.youtube.com/watch?v=p4q6LI-2yZ8)) + [The MCP Course You Need](https://www.youtube.com/watch?v=uD3wjGy7YL0) |
| 20 | Skills library and plugin packaging for the team | [agentskills.io](https://agentskills.io) spec + [anthropics/skills](https://github.com/anthropics/skills) examples + [B5](#b5-playbook-installing-and-governing-plugins-and-extensions)/[B6](#b6-playbook-developing-skills) |
| 21 | Production agents and vibe-coding to production | [Google 5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents) + the 2026 [Intensive Vibe Coding](https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google) livestreams |

Practice:

- [ ] Build an MCP server exposing your inventory API (read-only first); test it with the MCP Inspector; connect it to Claude and to Gemini CLI
- [ ] Turn your best 3–5 skills into a team plugin (or extension) that installs in one command
- [ ] Verify each skill and the server work in at least two different agents

## Phase 6 — Security, evals, cost and production (weeks 22–26)

Goal: be the person who can answer "is it good enough to ship, is it safe, and what will it cost?" — the skill that separates an AI lead from an AI user.

| Week | Focus | Resource |
| --- | --- | --- |
| 22 | Securing coding agents: permissions, sandboxing, secrets, supply chain of MCP/plugins/skills | [B9](#b9-playbook-enhancing-security) + your vendors' security docs |
| 23 | Securing AI features: prompt injection, the "lethal trifecta", data leakage | [OWASP Top 10 for LLM Applications](https://genai.owasp.org) + [Simon Willison on the lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) |
| 24 | Evals: error analysis, LLM-as-judge, evaluating agents | [AI Evals FAQ](https://hamel.dev/blog/posts/evals-faq/) and talks by Hamel Husain and Shreya Shankar |
| 25 | Cost and latency: model routing, caching, batching, observability | Both vendors' pricing and prompt-caching docs + [B10](#b10-playbook-context-cost-and-speed) |
| 26 | Capstone | Present the full stack to your team |

Practice:

- [ ] Build a 30-case eval set for your Phase 4 feature; run it against Claude and Gemini; report pass rates
- [ ] Write a one-page AI security checklist for code review and agent configuration ([B9](#b9-playbook-enhancing-security) has a starting point)
- [ ] Red-team your own agent setup: plant a prompt-injection instruction in a test file and see whether your permissions stop it
- [ ] Capstone: demo AGENTS.md + skills + MCP server + evaluated feature + security controls, with a cost estimate per 1,000 users

## Leading the team

Stay one phase ahead of the team: learn a phase yourself, then run it with them the following month.

| When | What you roll out to the team |
| --- | --- |
| Month 2 | "LLM basics" explainer + team AI coding rules; everyone picks a primary agent (Claude Code or Antigravity) and tries the other |
| Month 3 | Shared AGENTS.md in every repo; committed agent settings with a safe permission baseline; AI-assisted PRs say which tool was used and are human-reviewed |
| Month 4 | Approved MCP servers and plugins list; team skills library started; AI PR review in CI |
| Month 5 | First AI feature in the product behind the provider interface; internal MCP server |
| Month 6 | Eval sets required for every AI feature; security checklist in the PR template; quarterly tool scorecard |

Team rituals:

- **Friday AI share-out (15 min):** one person demos something they learned; rotate weekly
- **Tool scorecard:** a shared table rating tools on the same tasks (feature build, refactor, tests, debugging), refreshed quarterly so tool choices stay evidence-based
- **Pairing:** pair a stronger AI user with a newer one for one task per sprint
- **Skills and plugin reviews:** new skills, MCP servers and plugins go through a PR with a named reviewer, like any dependency
- **Metrics:** track PR cycle time, defect rate, escaped bugs in AI-written code and time saved per tool, not just usage

## Staying current after week 26

Keep the daily rhythm; swap the "Watch" day to whatever is new. Follow primary sources rather than hype channels.

- **Vendor release notes (weekly):** Claude Code changelog and Anthropic news; Gemini, Gemini CLI and Antigravity release notes; GitHub Copilot changelog; OpenAI Codex changelog; Cursor changelog
- **Official YouTube channels:** Anthropic, Google for Developers, Google DeepMind, Kaggle (for each new Intensive), Andrej Karpathy, AI Engineer (conference talks)
- **Practitioner blogs:** [Simon Willison](https://simonwillison.net) (especially security), [Hamel Husain](https://hamel.dev) (evals)
- **Standards to watch:** [agents.md](https://agents.md), [agentskills.io](https://agentskills.io), [modelcontextprotocol.io](https://modelcontextprotocol.io) and the [MCP registry](https://registry.modelcontextprotocol.io)
- **Quarterly:** re-run your tool scorecard and eval sets against the newest models; review the approved MCP/plugin list; update team guidance

A warning for filtering: many "best AI course" lists are written by people selling their own community or course. Prefer courses from model vendors, universities and known practitioners.

---

# Part B — The practitioner's handbook

## B1. The mental model: what you are actually configuring

Every coding agent — Claude Code, Gemini CLI, Copilot agent mode, Cursor, Codex, Antigravity — is the same machine with different labels. Learn the machine once:

```
            ┌───────────────────────────── CONTEXT (what the model sees) ─────────────────────────────┐
 you  ──►   │ system prompt · project instructions (AGENTS.md/CLAUDE.md) · memory · skills (on demand) │
            │ · your messages · file contents · tool results                                          │
            └──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                       ▼
                                                    MODEL ──► asks to call a TOOL
                                                       ▲              │
                     PERMISSIONS + HOOKS decide ───────┼──────────────┤  allowed? (allow / ask / deny,
                                                       │              ▼   sandbox, hook can block)
                                                 TOOL RESULT ◄── built-in tools (read, edit, shell, web)
                                                                 · MCP servers (GitHub, DB, Jira…)
                                                                 · subagents (a fresh context doing a sub-task)
```

| Piece | What it controls | Where it lives (Claude Code example) | Portable form |
| --- | --- | --- | --- |
| **Project instructions** | What the agent always knows about this repo | `CLAUDE.md` (imports `AGENTS.md`) | `AGENTS.md` |
| **Memory** | Facts it learns about you and the project across sessions | Auto-memory directory, `CLAUDE.local.md` / user `~/.claude/CLAUDE.md` | (tool-specific) |
| **Skills** | Task know-how loaded **only when relevant** | `.claude/skills/<name>/SKILL.md` | `SKILL.md` standard |
| **Tools** | What it can do | Built-in + MCP servers in `.mcp.json` | MCP |
| **Permissions** | What it may do without asking | `.claude/settings.json` → `permissions` | (tool-specific) |
| **Hooks** | Code that runs on events, can block or modify | `.claude/settings.json` → `hooks` | (tool-specific) |
| **Subagents** | Specialists with their own context and tools | `.claude/agents/<name>.md` | (tool-specific) |
| **Commands** | Saved prompts you trigger by name | `/name` — now delivered as skills | Prompt files |
| **Plugins** | A package of the above, installed in one step | Plugin marketplaces | Gemini CLI extensions are the closest |

**The three settings scopes** (most tools have an equivalent):

| Scope | File (Claude Code) | Shared with team? | Use for |
| --- | --- | --- | --- |
| User | `~/.claude/settings.json`, `~/.claude/CLAUDE.md` | No | Personal preferences, your own shortcuts |
| Project | `.claude/settings.json`, `CLAUDE.md`, `.mcp.json` | **Yes — committed** | Team rules, permissions baseline, shared MCP servers |
| Local | `.claude/settings.local.json`, `CLAUDE.local.md` | No (gitignored) | Your overrides for this repo |

On top of these, an organisation can push **managed settings** that users cannot override — that is where security baselines belong ([B9](#b9-playbook-enhancing-security)).

## B2. Playbook: product development with an AI agent

The workflow that works in every tool. Each step has a goal, what to tell the agent, and what *you* check.

### Step 1 — Explore before you change anything

Goal: the agent understands the relevant code before writing any.

> "Read how batches are received end to end — proto, service, DAO and the receive screen. Don't change anything. Summarise the flow and list the files involved."

You check: the summary is right. If it is wrong now, everything after will be wrong.

### Step 2 — Write the spec (the agent helps, you decide)

Goal: a short written statement of what "done" means.

> "Draft a one-page spec for splitting a batch into two lots: user story, rules, edge cases, what must NOT change, how we'll test it. Ask me about anything ambiguous."

You check: edge cases and non-goals. **This is the highest-leverage review you do.** A crisp spec turns a 2-hour correction loop into a 20-minute implementation.

### Step 3 — Plan, without editing

Goal: a step-by-step plan you approve before any file changes.

- Claude Code: **plan mode** (Shift+Tab to cycle modes), or simply "plan only, don't edit".
- Gemini CLI / Antigravity / Cursor / Copilot: ask for a plan first; Antigravity shows it as an artifact you comment on.

You check: order of changes, migrations, which tests, anything touching security or data.

### Step 4 — Implement in small, reviewable slices

Goal: diffs a human can actually review.

> "Implement step 1 of the plan only: the migration and DAO. Run the DAO tests. Stop and show me the diff."

Rules that hold everywhere:

- **One slice, one diff, one test run.** Never "implement the whole plan".
- **Tests first where it matters:** "Write failing tests for these 5 rules, run them, confirm they fail, then implement."
- **Commit after each green slice** so you can roll back cleanly.

### Step 5 — Verify like a sceptic

Goal: evidence, not the agent's word.

- The agent runs the real gates (build, tests, lint, formatter). Make this a rule in AGENTS.md.
- For UI: have it run the app and take screenshots (a browser MCP server or Playwright), in both themes and both browsers if styling changed.
- Ask: "What could be wrong with this change that the tests would not catch?" Agents are good at finding their own gaps when asked directly.

### Step 6 — Review: AI first, human last

1. A **review subagent or a second tool** reviews the diff with a checklist (correctness, security, tests, conventions) — [B7](#b7-playbook-subagents-hooks-and-custom-commands).
2. **A human reviews and owns the merge.** "The AI wrote it" is never a reason it was merged.
3. The PR says which tool was used and what was verified.

### Step 7 — Keep the knowledge

Goal: the next session (and the next person) does not relearn this.

- Update AGENTS.md / CLAUDE.md with any rule you had to repeat twice.
- Turn a repeated multi-step task into a skill ([B6](#b6-playbook-developing-skills)).
- Record design decisions in the docs, not in the chat.

### Prompt patterns that work

| Situation | Pattern |
| --- | --- |
| Vague request | "Before starting, ask me up to 5 questions that would change your approach." |
| Big task | "Break this into steps of under 200 lines of diff each. Do step 1 only." |
| Unfamiliar code | "Explain this module as if onboarding a new engineer, then list 3 risks of changing it." |
| Bug | "Reproduce it first with a failing test. Don't fix until the test fails for the right reason." |
| Refactor | "Behaviour must not change. List every public signature you will touch before editing." |
| Review | "Review as a strict senior engineer. Rank findings by severity; say 'none' if none." |
| Docs | "Update only the docs this change makes wrong. Show me the doc diff separately." |

## B3. Playbook: project instructions and memory

### What goes in AGENTS.md (and CLAUDE.md)

Keep it short (aim for under ~200 lines): it is loaded into **every** session and costs tokens every time. Put detail in skills or linked docs.

```markdown
# AGENTS.md

## Commands
- Build: `bazel build //... --config=ci`
- Test (frontend): `BAZEL_TEST=1 pnpm test` — without BAZEL_TEST it silently runs 7 of 135 tests
- Lint/format before every commit: `pnpm format && pnpm check`

## Layout
- `src/` Kotlin gRPC backend · `frontend/` Angular · `proto/` API contracts · `docs/` design record

## Rules
- Never edit an applied migration; add a new V{N} file.
- Every colour comes from a `--bf-*` token; read .claude/skills/frontend-styling first.
- A deliberate shortcut gets a row in docs/pre-production-checklist.md in the same PR.

## Never
- Commit to main; force-push; touch `secrets/`; paste customer data into prompts.
```

**What makes instructions effective:**

- **Say why, briefly.** "Never use `pnpm test` alone — it runs 7 of 135 tests" is followed far more reliably than "use BAZEL_TEST=1".
- **Commands exactly as typed.** Agents copy them.
- **Traps you have actually hit.** The most valuable lines are the ones that record a past mistake.
- **No essays, no history.** Long history wastes context and dilutes the rules that matter.

**Making one file serve every tool:**

| Tool | Reads | How to share AGENTS.md |
| --- | --- | --- |
| Codex, Cursor, Copilot, Gemini CLI, Windsurf | `AGENTS.md` | Directly (check each tool's support) |
| Claude Code | `CLAUDE.md` | Put `@AGENTS.md` at the top of CLAUDE.md (import), plus Claude-only extras below |
| Gemini CLI | `GEMINI.md` (configurable) | Import or configure the context file name to `AGENTS.md` |
| Copilot | `.github/copilot-instructions.md`, `*.instructions.md` | Point to or copy from AGENTS.md |
| Cursor | `.cursor/rules/*.mdc` | Rules can reference AGENTS.md |

**Nested instructions:** most tools also read instruction files in subdirectories (e.g. `frontend/AGENTS.md`), loaded when the agent works there. Use them for rules that only apply to one area.

### Memory

| Kind | What it is | Good for | Watch out |
| --- | --- | --- | --- |
| Project instructions | Committed file, always loaded | Team rules | Keep short |
| Personal instructions | User-level file | Your preferences everywhere | Not shared |
| Auto-memory | The agent writes notes it recalls later | "User wants PRs batched", "this test needs Docker" | Review it; delete wrong or stale notes |
| Session context | The current conversation | The task at hand | Lost on clear; summarise into files before ending |

Rule: **if it is true for the team, it goes in the repo; if it is true for you, it goes in memory.** Never put secrets in either.

## B4. Playbook: tool integrations with MCP

MCP lets any agent use external systems through one protocol. A **server** exposes *tools* (actions), *resources* (data to read) and *prompts*. The **client** (Claude Code, Gemini CLI, Cursor, VS Code…) connects to it.

### Choose integrations by the job

| Job | Typical MCP server | Tip |
| --- | --- | --- |
| Work issues and PRs | GitHub, GitLab | A well-known CLI (`gh`) the agent can run is often simpler and cheaper than an MCP server |
| Tickets and planning | Jira, Linear, Asana | Read + comment first; create/transition later |
| Errors in production | Sentry, Datadog | Read-only; great for "find the cause of this error" |
| Databases | Postgres/MySQL servers | **Read-only user, non-production replica.** Never production write access |
| UI testing and screenshots | Playwright / browser servers | Lets the agent verify its own UI work |
| Design | Figma | Pull specs and tokens into implementation |
| Docs | Internal wiki, docs search | Reduces hallucinated APIs |
| Your own systems | Your MCP server ([Phase 5](#phase-5--agents-mcp-servers-and-skills-you-build-weeks-1821)) | Start read-only |

Find servers in the [official MCP registry](https://registry.modelcontextprotocol.io) or vendors' own docs. Prefer **official servers from the vendor of the system**.

### Connecting a server (Claude Code)

```bash
# Local server started as a process (stdio)
claude mcp add inventory -- node ./mcp/inventory-server.js

# Remote server over HTTP (often with OAuth sign-in on first use)
claude mcp add --transport http linear https://mcp.linear.app/mcp

# Choose the scope: local (just you, this repo), project (committed .mcp.json), user (all your repos)
claude mcp add --scope project inventory -- node ./mcp/inventory-server.js

claude mcp list          # what is configured
/mcp                     # inside a session: status, sign-in, tools
```

A project-scoped server is stored in `.mcp.json`, committed so the team shares it:

```json
{
  "mcpServers": {
    "inventory": {
      "command": "node",
      "args": ["mcp/inventory-server.js"],
      "env": { "INVENTORY_API": "http://localhost:8090", "INVENTORY_TOKEN": "${INVENTORY_TOKEN}" }
    }
  }
}
```

Secrets come from **environment variables** (`${INVENTORY_TOKEN}`), never written into the file.

**Same thing elsewhere:** Gemini CLI uses `mcpServers` in `.gemini/settings.json` (project) or `~/.gemini/settings.json`; VS Code/Copilot uses `.vscode/mcp.json`; Cursor uses `.cursor/mcp.json`; Codex uses `[mcp_servers.<name>]` in `~/.codex/config.toml`. The server is identical — only the config file differs.

### Using integrations well

- **Name the tool in the prompt when it matters:** "Use the Sentry tools to find the top error in the last 24 h, then find the code that throws it."
- **Watch the context cost.** Each connected server adds its tool descriptions to the context, and big results (a whole table, a 2,000-line log) fill the window. Connect only what the repo needs; ask for filtered results.
- **Approve writes deliberately.** Keep write tools (create issue, merge, update row) on "ask" in permissions.
- **Test a server outside the agent first** with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector): `npx @modelcontextprotocol/inspector node ./mcp/inventory-server.js`.

### Building your own server (Phase 5)

1. Pick an SDK (official TypeScript or Python; FastMCP in Python is the quickest start).
2. Start with **2–3 read-only tools** with precise names and descriptions — the model chooses tools from their descriptions.
3. Return **small, structured** results; paginate; never dump whole tables.
4. Validate every input; enforce the caller's permissions server-side, never by trusting the model.
5. Test with the Inspector, then in two clients.
6. Add write tools only after read tools are trusted, and mark them clearly ("Creates a purchase order. Irreversible.").

## B5. Playbook: installing and governing plugins and extensions

A **plugin** (Claude Code) or **extension** (Gemini CLI) is a package that can add commands, skills, subagents, hooks and MCP servers in one install. Convenient — and it can run code on your machine with your permissions. Treat it like adding a dependency.

### Installing (Claude Code)

```bash
/plugin                                   # browse, install, enable/disable, inspect
/plugin marketplace add anthropics/claude-code     # add a marketplace (a git repo listing plugins)
/plugin install <plugin-name>@<marketplace-name>   # install one plugin from it
```

Gemini CLI: `gemini extensions install <git-repo-url>`, `gemini extensions list`, then enable/disable per project. VS Code / Cursor: their extension marketplaces plus MCP configuration.

### Before you install anything — the 5-minute review

1. **Who publishes it?** Vendor or known maintainer > anonymous repo. Check stars, activity, issues.
2. **Read what it adds.** Open the repository: list its commands, skills, subagents, **hooks** and **MCP servers**.
3. **Hooks and MCP servers are code that runs.** Read every script. Look for network calls (`curl`, `fetch`), reading files outside the repo (`~/.ssh`, `.env`), or obfuscated content.
4. **Skills can include scripts** too — read them.
5. **Pin a version** (a tag or commit) for team use; updates are new code to review.
6. **Install at the narrowest scope** (project or local), not user-wide, until trusted.

### Governing plugins for a team

- Keep an **approved list** (in the repo or wiki) with owner, version and review date.
- Configure recommended marketplaces/plugins in the **project settings** so teammates get the same set (check your tool's current setting names); block unapproved ones with **managed settings** where your plan supports it.
- **Build your own team plugin** for your skills, commands and subagents ([Phase 5](#phase-5--agents-mcp-servers-and-skills-you-build-weeks-1821)): one install gives a new hire the whole toolkit.
- Re-review quarterly and remove what nobody uses: each enabled plugin adds context and attack surface.

## B6. Playbook: developing skills

A **skill** is a folder with a `SKILL.md` file (instructions) and optional supporting files (scripts, templates, reference docs). The agent sees only each skill's **name and description** until a task matches; then it loads the body. That "progressive disclosure" means you can have dozens of skills without filling the context.

### Anatomy

```
.claude/skills/angular-component/        (or .agents/skills/… for cross-tool use)
├── SKILL.md            ← required: frontmatter + instructions
├── template.component.ts
├── checklist.md        ← loaded only if SKILL.md tells the agent to read it
└── scripts/
    └── check_unstyled_classes.py
```

```markdown
---
name: angular-component
description: Creates or changes an Angular standalone component in this repo following our
  conventions. Use when adding a screen, dialog, card, form or widget under frontend/app.
---

# Angular component

1. Find the nearest existing screen that does the same job and reuse its classes. Never invent
   a button or input style; the shared classes are listed in checklist.md.
2. Every colour comes from a `--bf-*` token. A raw hex is light-mode only.
3. Write the spec file next to the component; render with Testing Library, query by role.
4. Before saying done, run `python3 scripts/check_unstyled_classes.py` and `pnpm check`.
5. Look at it in light and dark themes.
```

### The description is the trigger

The model decides to use a skill from its description alone. A good description says **what it does and when to use it**, in the words people actually type.

| Weak | Strong |
| --- | --- |
| "Angular helper" | "Creates or changes an Angular component following our conventions. Use when adding a screen, dialog, card, form or widget under frontend/app." |
| "DB stuff" | "Writes a Flyway migration. Use whenever a table, column or index changes. Never edits an applied migration." |

### Which tasks deserve a skill

A good candidate is a task that is **repeated, multi-step, has conventions people forget, and has a check at the end**:

- creating a component / endpoint / migration per house rules
- writing tests the house way
- the PR review checklist
- the release checklist (build, test, migrate, deploy, verify)
- generating a report or document in a fixed format

Not a skill: one-off tasks, facts every session needs (those go in AGENTS.md), or anything better done by a deterministic script (make it a script; let the skill call it).

### Writing rules

- **Imperative steps, numbered.** The agent follows procedures better than prose.
- **Include the check.** End with the command that proves it was done right.
- **Keep SKILL.md lean;** move long references into separate files the body points to.
- **Scripts for anything exact** (validation, formatting, file generation). Text instructions drift; scripts do not.
- **Say why for every non-obvious rule**, as in AGENTS.md.

### Testing a skill

1. **Trigger test:** ask 5 natural requests that *should* use it and 5 that *should not*. Fix the description until both pass.
2. **Outcome test:** run it on a real task; review the result against the skill's own checklist.
3. **Cross-tool test:** run it in a second agent that supports the standard.
4. **Regression:** when a skill fails in real use, add the case to your trigger/outcome tests, then fix the skill.

### Sharing skills

| Reach | How |
| --- | --- |
| Just you | User-level skills directory (`~/.claude/skills/`) |
| One repo's team | `.claude/skills/` or `.agents/skills/` committed in the repo |
| Many repos / the org | A team plugin or extension that bundles the skills ([B5](#b5-playbook-installing-and-governing-plugins-and-extensions)) |

## B7. Playbook: subagents, hooks and custom commands

### Subagents — specialists with a clean context

A subagent runs a sub-task in **its own context window** with **its own tools**, and returns only a summary. Use them to keep the main conversation small and to apply a specialist's checklist.

```markdown
<!-- .claude/agents/security-reviewer.md -->
---
name: security-reviewer
description: Reviews a diff for security problems. Use after changes to auth, input handling,
  file access, SQL, secrets or anything that calls external services.
tools: Read, Grep, Glob, Bash
model: opus
---
You are a strict application-security reviewer. Review only the current diff (`git diff main...HEAD`).
Check: injection (SQL, command, prompt), authorisation on every new endpoint, secrets in code or logs,
unsafe deserialisation, missing input validation, overly broad permissions.
Report findings ranked by severity with file:line and a concrete fix. Say "No findings" if none.
Never edit files.
```

Good subagents: `security-reviewer`, `test-writer`, `code-explorer` (searches a large codebase and reports only the answer), `docs-updater`, `migration-checker`. Create them with `/agents` in Claude Code. In other tools, the closest equivalents are separate agent sessions or Antigravity's Agent Manager running parallel agents.

**Parallel work:** run independent tasks in separate agents on separate **git worktrees** (`git worktree add ../repo-feature-b feature-b`) so they never edit the same files.

### Hooks — deterministic rules around the agent

Instructions are suggestions; **hooks are guarantees.** A hook is a command that runs on an event (before a tool runs, after a file is edited, when a session starts or stops). In Claude Code a `PreToolUse` hook that exits with code 2 **blocks** the action and tells the model why.

```json
// .claude/settings.json (excerpt)
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/block-dangerous.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": ".claude/hooks/format.sh" }] }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/block-dangerous.sh — the hook receives the tool call as JSON on stdin
cmd=$(jq -r '.tool_input.command // ""')
if echo "$cmd" | grep -Eq 'rm -rf /|git push .*--force|DROP TABLE|cat .*\.env'; then
  echo "Blocked by team policy: $cmd" >&2
  exit 2          # blocks the call; stderr is shown to the model
fi
```

Useful hooks:

| Event | Hook | Why |
| --- | --- | --- |
| Before a shell command | Block destructive or exfiltrating commands | A hard stop that prompt injection cannot talk its way past |
| After an edit | Run the formatter on the changed file | Every diff is formatted without asking |
| After an edit | Run the fast tests for that area | Earlier feedback |
| Session start | Print branch, open PRs, stale build warnings | Better situational awareness |
| Stop | Remind to run the full gates if code changed | Fewer "done" claims without tests |

Manage them with `/hooks` in Claude Code. Gemini CLI, Copilot and Cursor have growing hook/automation support — check current docs. Git hooks (pre-commit) also work for every tool, because they run whoever commits.

### Custom commands — saved prompts by name

A command is a prompt you trigger with `/name` (in Claude Code these are now part of skills; a skill can be invoked directly). Good commands are short and fixed:

- `/review-pr` — run the review checklist on the current branch
- `/release-notes` — draft notes from merged PRs since the last tag
- `/explain-file` — onboarding explanation of the open file

Copilot uses **prompt files** (`.github/prompts/*.prompt.md`), Gemini CLI uses custom commands in its config directory, Cursor uses rules and commands — same idea.

## B8. Playbook: automation — headless runs, CI and scheduled agents

Every serious agent can run **without a chat window**, which turns it into a building block for scripts and pipelines.

```bash
# One-shot, non-interactive, machine-readable result, read-only tools
claude -p "List functions in src/ with no unit tests. Output JSON." \
  --output-format json \
  --allowedTools "Read,Grep,Glob"
```

Gemini CLI: `gemini -p "…"`. Codex: `codex exec "…"`. Copilot: the **coding agent** takes a GitHub issue and opens a PR.

### High-value automations

| Automation | Trigger | Permissions |
| --- | --- | --- |
| AI PR review comment | Every PR (GitHub Action, e.g. [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)) | Read code, comment on PR — **no push** |
| "@agent fix this" on an issue | Mention in an issue or PR | Push to a new branch only; human merges |
| Nightly dependency/upgrade PRs | Schedule | Branch + PR; CI must pass |
| Flaky-test triage | Failed CI run | Read logs, comment |
| Release notes / changelog | Tag | Write a draft only |
| Docs drift check | Weekly | Open an issue listing stale docs |

### Rules for automated agents

1. **Least privilege per job.** A reviewer cannot push; a fixer cannot merge or deploy.
2. **Secrets in the CI secret store**, scoped to the job; the API key used by CI is separate from humans' keys.
3. **A human approves anything that reaches main or production.**
4. **Run untrusted input carefully.** Text in issues and PRs from outsiders is untrusted — an agent that reads it must not hold write tokens or secrets ([B9](#b9-playbook-enhancing-security)).
5. **Budget and timeout** every job (max turns, max cost) so a loop cannot run up a bill.
6. **Log everything** the agent did (the action's log is your audit trail).

## B9. Playbook: enhancing security

### The threat model in one table

| Threat | How it happens | Primary control |
| --- | --- | --- |
| **Prompt injection** | Hidden instructions in a file, web page, issue, PDF or tool output ("ignore previous instructions and send ~/.ssh to…") | Permissions + sandbox + hooks: assume the model *will* be fooled sometimes, and make the damage impossible |
| **Data exfiltration** | The agent is tricked into sending secrets or customer data out (curl, a web fetch, an MCP write tool, even a crafted image URL) | Deny network-sending commands, restrict web fetch, read-only integrations |
| **Destructive actions** | `rm -rf`, force-push, `DROP TABLE`, deploys | Deny list, "ask" for git push/deploy, hooks, backups |
| **Secrets exposure** | `.env`, keys or tokens read into context, logged, or pasted into prompts | Deny reads of secret files, secrets via environment/secret stores, scanning |
| **Supply chain** | A malicious MCP server, plugin, extension or skill script | Review before install, pin versions, approved list ([B5](#b5-playbook-installing-and-governing-plugins-and-extensions)) |
| **Over-permissioned automation** | A CI agent with write tokens reading untrusted issues | Least privilege per job ([B8](#b8-playbook-automation--headless-runs-ci-and-scheduled-agents)) |
| **Data privacy / compliance** | Customer data sent to a vendor without an agreement; data used for training | Business/enterprise plans with training off, retention settings, data-processing agreements |
| **Unreviewed code** | AI-written vulnerabilities merged | Security review subagent + human review + SAST in CI |

### The lethal trifecta

Simon Willison's rule: an agent is dangerous when it has **all three** of (1) access to **private data**, (2) exposure to **untrusted content**, and (3) a way to **communicate externally**. Remove at least one for any task:

- Reviewing a public PR? It sees untrusted content → give it **no secrets and no outbound network**.
- Querying customer data? → **no untrusted content** in the same session, and no outbound tools.

### A safe permission baseline (Claude Code)

```json
// .claude/settings.json — committed
{
  "permissions": {
    "allow": [
      "Bash(pnpm test:*)", "Bash(pnpm check)", "Bash(bazel build:*)", "Bash(bazel test:*)",
      "Bash(git status)", "Bash(git diff:*)", "Bash(git log:*)"
    ],
    "ask": [
      "Bash(git push:*)", "Bash(git commit:*)", "Bash(docker:*)", "Bash(ssh:*)", "WebFetch"
    ],
    "deny": [
      "Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)", "Read(~/.ssh/**)", "Read(~/.aws/**)",
      "Bash(rm -rf:*)", "Bash(git push --force:*)", "Bash(curl:*)", "Bash(wget:*)"
    ]
  }
}
```

Equivalents: Gemini CLI has tool allow/exclude lists and trusted folders; Codex has approval modes and sandbox modes (read-only, workspace-write); Copilot and Cursor have per-tool approvals and terminal allowlists. The principle is the same: **allow the routine, ask for the consequential, deny the dangerous.**

### Sandboxing and isolation

- **Sandbox mode** (Claude Code's sandboxing, Gemini CLI `--sandbox`, Codex sandbox modes) limits what commands can touch: filesystem and network.
- **Fully autonomous modes** (skipping all permission prompts) **only inside a disposable container or VM** with no secrets and no production credentials — never on your laptop with your SSH keys.
- **Dev containers** give each agent a clean, reproducible, isolated environment.
- **Separate credentials for agents:** a read-only database user, a GitHub token scoped to one repo, short-lived cloud credentials.

### Secrets

- Never paste secrets into prompts; never let them land in AGENTS.md, memory or skills.
- Keep secrets in files the agent is denied from reading, or in environment variables injected at runtime.
- Run a secret scanner (e.g. gitleaks) in pre-commit and CI: agents produce code fast, including mistakes.
- If a secret was exposed to an agent session or a log, **rotate it**. Deleting the message is not enough.

### Organisation controls

- **Managed settings** pushed by the organisation (permission baseline, disallowed MCP servers/plugins, required sandbox) that users cannot override.
- **Enterprise/Team plans** with data-retention controls and no training on your data; know which plan each tool is used under.
- **Audit logs / usage analytics** reviewed monthly.
- **An approved list** for models, tools, MCP servers, plugins and skills, owned by a named person.

### Security checklist (for PR templates and setups)

- [ ] No secrets, tokens or customer data in the diff, prompts, instructions, skills or logs
- [ ] New endpoints/tools enforce authorisation server-side
- [ ] AI features treat external content as data; no tools that can exfiltrate or delete
- [ ] Agent permissions for this repo: deny secrets and destructive commands; ask before push/deploy
- [ ] New MCP servers / plugins / skills reviewed, pinned and on the approved list
- [ ] Automated agents use least-privilege, job-scoped credentials and cannot merge or deploy
- [ ] Security review subagent run on sensitive changes; human reviewer signed off

## B10. Playbook: context, cost and speed

### Managing context (the most underrated skill)

- **Start fresh per task.** A clean session per feature beats one endless conversation (`/clear` in Claude Code).
- **Compact long sessions** (`/compact`) or summarise into a file before starting a new one.
- **Delegate searching to subagents** so file dumps never enter the main context.
- **Point, don't paste.** "Read `frontend/app/features/inventory/fefo-queue/`" beats pasting 800 lines.
- **Fewer, sharper integrations.** Every MCP server and plugin adds tool descriptions to every request.
- **Keep AGENTS.md short;** move detail into skills, which load only when needed.

### Controlling cost

| Lever | How |
| --- | --- |
| Model tier | Fast model for search, formatting, simple edits; strongest model for design, hard bugs, reviews |
| Reasoning effort | Raise only for genuinely hard problems |
| Prompt caching | Stable prefixes (instructions, tool definitions) are cached and billed cheaper — keep them stable |
| Batching | Non-urgent bulk jobs through batch APIs at a discount |
| Smaller outputs | Ask for diffs or JSON, not essays |
| Budgets | Per-job turn and cost limits in automation; per-tenant limits in product features |
| Measure | Track cost per merged PR or per feature, not just total spend |

### Speed

- Run independent tasks **in parallel** (worktrees + separate agents).
- Give the agent **fast feedback loops** (targeted tests, not the full suite every time).
- Allow routine commands in permissions so you are not clicking "approve" forty times.

## B11. Playbook: when the agent goes wrong

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Confident but wrong about your code | It did not read the code; stale assumptions | "Read X and Y first and quote the relevant lines before answering." |
| Ignores a rule | The rule is buried, vague, or has no reason | Move it to the top of AGENTS.md with the *why*; or enforce it with a hook |
| Goes in circles on a bug | Context polluted by failed attempts | Stop. Start a fresh session with a summary of what was tried and a failing test |
| Huge, unreviewable diff | Task too big | Revert; re-plan in slices ([B2](#b2-playbook-product-development-with-an-ai-agent) step 4) |
| "Tests pass" but they don't | It ran the wrong command or a subset | Put the exact command, and the trap, in AGENTS.md; ask for the test output |
| Invents an API | Training cutoff or unfamiliar library | Give it the docs (docs MCP server or link); ask it to verify against the source |
| Slows down, forgets earlier decisions | Context window near full | Compact or start fresh; keep decisions in files |
| Did something you didn't want | Permissions too broad | Roll back (checkpoints/rewind, or git), then tighten permissions |

**Undo options:** Claude Code keeps checkpoints you can rewind to (press Esc twice); Gemini CLI has checkpointing and restore; every tool works with **git** — commit after each good slice and you can always go back.

**Know when to stop delegating:** if you have corrected the same thing three times, write the code yourself or rewrite the spec. The agent is a fast junior engineer with a perfect memory for syntax and none for your intent.

## B12. Cross-tool cheat sheet

Verify against current docs; these move quickly.

| Capability | Claude Code | Gemini CLI | GitHub Copilot (VS Code) | Cursor | Codex CLI |
| --- | --- | --- | --- | --- | --- |
| Project instructions | `CLAUDE.md` (import `AGENTS.md`) | `GEMINI.md` (configurable to `AGENTS.md`) | `.github/copilot-instructions.md`, `*.instructions.md`, `AGENTS.md` | `.cursor/rules/`, `AGENTS.md` | `AGENTS.md` |
| Settings | `.claude/settings.json` (+ user, local, managed) | `.gemini/settings.json`, `~/.gemini/settings.json` | VS Code settings | Cursor settings | `~/.codex/config.toml` |
| MCP config | `claude mcp add`, `.mcp.json` | `mcpServers` in settings | `.vscode/mcp.json` | `.cursor/mcp.json` | `[mcp_servers]` in config.toml |
| Skills (SKILL.md) | `.claude/skills/` | Supported | Supported | Supported | Supported |
| Packages | Plugins + marketplaces | Extensions | VS Code extensions | Extensions | — |
| Subagents / parallel | `.claude/agents/`, worktrees | Parallel sessions | Coding agent (issues → PRs) | Background agents | Parallel sessions |
| Hooks | `hooks` in settings | Check current docs | Check current docs | Check current docs | Check current docs |
| Plan first | Plan mode (Shift+Tab) | Ask for a plan | Plan / ask mode | Plan mode | Ask / approval modes |
| Headless | `claude -p` | `gemini -p` | Coding agent, CLI | Background agents | `codex exec` |
| Undo | Checkpoints (Esc Esc), git | Checkpointing, git | Git | Checkpoints, git | Git |
| Sandbox | Sandboxing, permissions | `--sandbox` | Approvals | Approvals | Sandbox modes |

## B13. Case study: a real repository set up for agents

Your own BatchFloor repository is a working example of most of Part B. Study it as a pattern library:

| Practice | Where it lives | Lesson |
| --- | --- | --- |
| Project instructions with reasons | `CLAUDE.md` | Every rule carries its *why*, and many record a past failure ("a bare `pnpm test` runs 7 of 135 tests") |
| Docs-as-source-of-truth rule | `CLAUDE.md` "Keeping docs in sync" table | The agent knows which doc to update for each kind of change |
| A skill for a house style | `.claude/skills/frontend-styling/SKILL.md` | Procedure + shared classes + checker scripts to run before "done" |
| Deterministic checks the agent runs | `tools/check_unstyled_classes.py`, `check_theme_contrast.py`, `tools/preflight.sh` | Scripts enforce what prose cannot |
| A pre-commit hook | `.husky/pre-commit` | Fast checks on every commit, whoever (or whatever) commits |
| Rules files for languages | `.claude/rules/kotlin/*`, `.claude/rules/flutter/*` | Language conventions loaded as instructions |
| Shortcuts recorded, not hidden | `docs/pre-production-checklist.md` | An agent's deliberate shortcut gets a row in the same PR |
| Memory for preferences | Claude Code auto-memory | "Batch features into one PR", "verify with real hardware" |
| Human gates | PR review, pre-ship testing runbook | The agent prepares; a person approves releases |

Exercise: copy this pattern into a second repo in an afternoon, then compare how much less you correct the agent there after a week.

---

## Course library

All free. "Portable" means the lessons apply in any vendor's tools.

| Course | Provider | Phase | Portable? |
| --- | --- | --- | --- |
| [Intro to Large Language Models](https://www.youtube.com/@AndrejKarpathy) | Andrej Karpathy | 1 | Yes |
| [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) | Andrej Karpathy | 1 | Yes |
| [Neural Networks series](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) | 3Blue1Brown | 1 (optional) | Yes |
| [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) | Andrej Karpathy | Optional deep track | Yes |
| [Anthropic Academy](https://anthropic.skilljar.com) | Anthropic | 2–4 | Concepts yes, labs Claude |
| [5-Day Gen AI Intensive](https://www.kaggle.com/learn-guide/5-day-genai) | Google + Kaggle | 2–4 | Mostly (Gemini codelabs) |
| [Antigravity tutorial for beginners](https://www.youtube.com/watch?v=1Q5sWISByuw) | YouTube creator | 2 | Antigravity-specific |
| [Antigravity in 5 minutes](https://www.youtube.com/watch?v=LroJ8KEiTo4) | YouTube creator | 2 | Antigravity-specific |
| [Gemini CLI docs](https://github.com/google-gemini/gemini-cli) | Google | 2–3 | Gemini CLI-specific |
| [Mastering LLMs open course](https://hamel.dev/blog/posts/course/) | Hamel Husain + practitioners | 4, 6 | Yes |
| [AI Agents Course](https://huggingface.co/learn/agents-course) | Hugging Face | 5 | Yes |
| [5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents) | Google + Kaggle | 4–6 | Mostly (ADK labs) |
| [MCP Course](https://huggingface.co/learn/mcp-course) ([intro video](https://www.youtube.com/watch?v=p4q6LI-2yZ8)) | Hugging Face | 5 | Yes |
| [The MCP Course You Need](https://www.youtube.com/watch?v=uD3wjGy7YL0) | Kubesimplify | 5 | Yes |
| [Agent Skills spec](https://agentskills.io) + [anthropics/skills](https://github.com/anthropics/skills) | Anthropic / open standard | 3, 5 | Yes |
| [OWASP Top 10 for LLM Applications](https://genai.owasp.org) | OWASP | 6 | Yes |
| [AI Evals FAQ + talks](https://hamel.dev/blog/posts/evals-faq/) | Hamel Husain, Shreya Shankar | 6 | Yes |

Sources: [Kaggle Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents) · [Kaggle Vibe Coding Intensive 2026](https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google/discussion/708114) · [Agent Skills adoption](https://strapi.io/blog/what-are-agent-skills-and-how-to-use-them) · [AGENTS.md cross-tool support](https://github.com/eugeniughelbur/agents-md) · [Karpathy course notes](https://github.com/karpathy/nn-zero-to-hero) · [Hamel Husain blog](https://hamel.dev/) · [The lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) · [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
