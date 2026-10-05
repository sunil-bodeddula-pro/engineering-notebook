# AI Engineering Leadership Roadmap

Oct 4, 2026

## How to use this roadmap

A 26-week, 30-minutes-a-day plan that takes you from "some experience" to the person your team asks about AI tooling. It is built tool-agnostic: you learn the concepts and open standards once, then apply them in Claude, Gemini / Antigravity, GitHub Copilot, Cursor, Codex or whatever ships next.

- **Learn the layer below the tool.** Models, context, tools, agents and evals work the same way everywhere. Tool UIs change monthly; these concepts change yearly.
- **Practice every concept in two tools.** For each weekly exercise, do it in one Anthropic tool and one Google tool (for example Claude Code and Antigravity / Gemini CLI). Noting what differs is how you become the team's guide.
- **Ship into a real codebase.** Use your own Angular project as the practice ground so every lesson produces something reusable for the team.
- **Teach weekly.** A 15-minute share-out each Friday locks in learning and seeds the team rollout (see Leading the team).

## The portable skill stack

Three open standards now make most of your work portable across vendors, so learn these first and the tool-specific parts become small.

| Standard | What it does | Who reads it | Learn it in |
| --- | --- | --- | --- |
| [AGENTS.md](https://agents.md) | One Markdown file in the repo root with build/test commands, conventions and boundaries for coding agents | Codex, Cursor, Copilot, Gemini CLI, Windsurf and more; Claude Code reads CLAUDE.md, so symlink or import it ([guide](https://www.eesel.ai/blog/claude-code-agents-md)) | Phase 2 |
| [Agent Skills (SKILL.md)](https://agentskills.io) | A folder of instructions + scripts an agent loads on demand for a specific task | Released by Anthropic as an open standard in Dec 2025; adopted by Codex, Gemini CLI, Copilot, Cursor, VS Code, Antigravity and 20+ others ([overview](https://www.firecrawl.dev/blog/agent-skills)) | Phase 4 |
| [MCP (Model Context Protocol)](https://modelcontextprotocol.io) | A standard way to plug tools and data sources (Jira, DBs, GitHub, your APIs) into any AI client | Claude, Gemini, Copilot, Cursor, Antigravity and most agent frameworks | Phase 4 |

Under those standards sit the concepts that never depend on a vendor:

| Layer | Concepts to master | Same idea in Claude vs Gemini / Antigravity |
| --- | --- | --- |
| Model | Tokens, context window, temperature, reasoning modes, model tiers (fast vs smart) | Haiku / Sonnet / Opus vs Flash / Pro |
| Context | Prompt structure, few-shot examples, project instructions, memory, context engineering | CLAUDE.md vs GEMINI.md, both via AGENTS.md |
| Tools | Function calling, structured JSON output, MCP servers | Tool use API vs function calling API; MCP in both |
| Agents | Plan → act → observe loop, sub-agents, human approval, guardrails | Claude Code sub-agents vs Antigravity Agent Manager |
| Quality | Evals, error analysis, LLM-as-judge, tracing | Vendor-neutral (your own test sets) |
| Safety and cost | Prompt injection, secrets, data privacy, token cost, rate limits | Same risks everywhere |

Rule of thumb for the team: **put knowledge in AGENTS.md, skills and MCP servers, not in one tool's settings.** Then switching tools costs a day, not a quarter.

## Daily learning system

Thirty minutes a day, five days a week, with a fixed theme per day so you never waste time deciding what to learn.

| Day | Theme (30 min) | Output |
| --- | --- | --- |
| Monday | **Watch:** one video or course lesson from the current phase | 3 bullet notes in your learning log |
| Tuesday | **Build:** apply Monday's idea in your project with tool A (e.g. Claude Code) | A commit or a saved prompt |
| Wednesday | **Cross-check:** repeat the same task with tool B (e.g. Antigravity / Gemini CLI) | One line: what differed, which was better |
| Thursday | **Read:** release notes or one article from the Staying current list | One thing that changed this week |
| Friday | **Teach:** 15-minute share-out to the team + update AGENTS.md / skills | A team-visible artifact |

Weekend (optional, 1–2 hours): longer course module or a mini-project from the current phase.

Keep a single learning log (this doc, a repo `LEARNING.md`, or a notes app) with date, what you learned, and a link. After 26 weeks it becomes your team onboarding guide.

## Phase 1 — Foundations: how LLMs actually work (weeks 1–4)

Goal: explain to any engineer why a model hallucinates, why context size matters, and why the same prompt behaves differently across models.

| Week | Focus | YouTube course / video |
| --- | --- | --- |
| 1 | Neural networks intuition | [3Blue1Brown — Neural Networks series](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) (chapters on transformers and attention are the key ones) |
| 2 | LLMs end to end: pre-training, fine-tuning, RLHF, tokens | [Andrej Karpathy — Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) (~3.5 h, split over the week) |
| 3 | Using LLMs well as a power user | Karpathy — Intro to Large Language Models and How I use LLMs (both on his channel) |
| 4 (optional deep track) | Build a GPT from scratch | [Karpathy — Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html): code from backprop up to a GPT and its tokenizer ([repo](https://github.com/karpathy/nn-zero-to-hero)) |

Practice:

- [ ] Write a one-page "LLM basics for our team" explainer: tokens, context window, temperature, hallucination
- [ ] Run the same 5 prompts in Claude and Gemini; log differences in tone, accuracy and refusal
- [ ] Estimate token cost for one feature idea in your app using both vendors' pricing pages

Zero to Hero is the gold standard but takes 30+ hours. Treat it as a weekend track running alongside phases 2–3, not a blocker.

## Phase 2 — AI-assisted development across tools (weeks 5–9)

Goal: one workflow your whole team can use in any coding agent — plan, implement, test, review — driven by a shared AGENTS.md.

| Week | Focus | YouTube course / resource |
| --- | --- | --- |
| 5 | Prompting and context engineering: role, examples, constraints, output format | [Anthropic Academy](https://anthropic.skilljar.com) prompt engineering course (free, vendor concepts apply everywhere) + Google's Gen AI Intensive Day 1 livestream ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-genai)) |
| 6 | Agentic coding tool #1: Claude Code (terminal + IDE) | Anthropic Academy "Claude Code in Action" + official Anthropic YouTube channel demos |
| 7 | Agentic coding tool #2: Google Antigravity / Gemini CLI | [Antigravity tutorial for beginners](https://www.youtube.com/watch?v=1Q5sWISByuw) (builds an app, adds features) and the [5-minute Editor vs Agent Manager overview](https://www.youtube.com/watch?v=LroJ8KEiTo4) |
| 8 | Shared instructions: AGENTS.md, CLAUDE.md, GEMINI.md, Copilot instructions | [agents.md](https://agents.md) spec + [AGENTS.md vs CLAUDE.md explainer](https://www.eesel.ai/blog/claude-code-agents-md) |
| 9 | Team workflow: spec-first prompts, small diffs, AI code review, tests first | Practice week — no new videos |

Practice:

- [ ] Write an AGENTS.md for your Angular repo (commands, folder map, conventions, "never touch" list); link CLAUDE.md and GEMINI.md to it
- [ ] Implement the same small feature in Claude Code and Antigravity from the same spec; compare diff quality and time
- [ ] Draft a team "AI coding rules" page: when to use agents, review requirements, what not to paste (secrets, customer data)

## Phase 3 — Building LLM features into products (weeks 10–14)

Goal: ship one AI feature behind a provider-agnostic interface, so the team can swap Claude and Gemini by config.

| Week | Focus | YouTube course / resource |
| --- | --- | --- |
| 10 | Calling model APIs: messages, streaming, system prompts, structured JSON output | Anthropic Academy API course + Gemini API quickstarts; compare both side by side |
| 11 | Embeddings and vector search | Google Gen AI Intensive Day 2 (embeddings and vector stores) livestream + codelab ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-genai)) |
| 12 | RAG: chunking, retrieval, reranking, citing sources | [Mastering LLMs open course](https://hamel.dev/blog/posts/course/) — RAG talks (free practitioner workshops on YouTube) |
| 13 | Tool / function calling | Google Agents Intensive Day 2 (tools) livestream ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-agents)) |
| 14 | Provider abstraction and fallbacks | Practice week |

Practice (ideas from your batch and expiration tracker):

- [ ] "Ask your inventory": natural-language questions over stock data using tool calling ("what expires this week in dairy?")
- [ ] Parse supplier invoices or labels into structured JSON (batch number, expiry date) with schema validation
- [ ] Put both behind one `LlmProvider` interface with Claude and Gemini adapters; switch via environment config

## Phase 4 — Agents, MCP and Agent Skills (weeks 15–20)

Goal: build reusable team capabilities — an MCP server and a set of skills — that work in Claude, Antigravity, Gemini CLI, Copilot and Cursor unchanged.

| Week | Focus | YouTube course / resource |
| --- | --- | --- |
| 15 | Agent fundamentals: loops, planning, memory, multi-agent | [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course) (free, certificate; covers smolagents, LangGraph, LlamaIndex) |
| 16 | Production agents, Google view | [Google 5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents): recorded livestreams + codelabs on tools, context engineering, observability, evaluation, A2A and deployment |
| 17 | MCP concepts | [Hugging Face MCP Course intro](https://www.youtube.com/watch?v=p4q6LI-2yZ8) ([full course](https://huggingface.co/learn/mcp-course)) |
| 18 | Build an MCP server | [The MCP Course You Need](https://www.youtube.com/watch?v=uD3wjGy7YL0) hands-on workshop |
| 19 | Agent Skills (SKILL.md) | [agentskills.io](https://agentskills.io) spec + [anthropics/skills](https://github.com/anthropics/skills) reference examples |
| 20 | Vibe-coding to production | Google's 2026 [5-Day AI Agents: Intensive Vibe Coding](https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google) livestreams (ran June 2026 on Kaggle's YouTube channel) |

Practice:

- [ ] Build an MCP server exposing your inventory API (read-only first); connect it to Claude and to Antigravity / Gemini CLI
- [ ] Write 3 team skills: "create Angular component per our conventions", "write unit tests", "PR review checklist"; store in `.agents/skills/` in the repo
- [ ] Verify each skill works in at least two different agents

## Phase 5 — Evals, security, cost and production (weeks 21–26)

Goal: be the person who can answer "is it good enough to ship, is it safe, and what will it cost?" — the skill that separates an AI lead from an AI user.

| Week | Focus | YouTube course / resource |
| --- | --- | --- |
| 21 | Why evals matter; error analysis | [AI Evals FAQ](https://hamel.dev/blog/posts/evals-faq/) by Hamel Husain and Shreya Shankar — links their free YouTube talks, including "Error Analysis: The Highest ROI Technique" |
| 22 | LLM-as-judge and automated evals | Same FAQ: "How to Automate AI Evals (Correctly)" video; [Lenny's Podcast episode with Hamel](https://www.lennysnewsletter.com/p/evals-error-analysis-and-better-prompts) (also on YouTube) |
| 23 | Evaluating agents, observability and tracing | Google Agents Intensive Day 4 (observability + evaluation) livestream ([Kaggle guide](https://www.kaggle.com/learn-guide/5-day-agents)) |
| 24 | Security: prompt injection, tool permissions, secrets, data leakage | OWASP Top 10 for LLM Applications + your vendors' security docs |
| 25 | Cost and latency: model routing, caching, batching | Both vendors' pricing and prompt-caching docs |
| 26 | Capstone | Present the full stack to your team |

Practice:

- [ ] Build a 30-case eval set for your Phase 3 feature; run it against Claude and Gemini; report pass rates
- [ ] Write a one-page AI security checklist for code review (injection, tool scopes, PII)
- [ ] Capstone: demo AGENTS.md + skills + MCP server + evaluated feature, with a cost estimate per 1,000 users

## Leading the team

Stay one phase ahead of the team: learn a phase yourself, then run it with them the following month.

| When | What you roll out to the team |
| --- | --- |
| Month 2 | "LLM basics" explainer + team AI coding rules; everyone picks a primary agent (Claude Code or Antigravity) and tries the other |
| Month 3 | Shared AGENTS.md in every repo; AI-assisted PRs must say which tool was used and be human-reviewed |
| Month 4 | First AI feature in the product behind the provider interface |
| Month 5 | Team skills library and internal MCP servers; engineers contribute one skill each |
| Month 6 | Eval sets required for every AI feature; security checklist in PR template |

Team rituals:

- **Friday AI share-out (15 min):** one person demos something they learned; rotate weekly
- **Tool scorecard:** a shared table rating tools on the same tasks (feature build, refactor, tests, debugging), refreshed quarterly so tool choices stay evidence-based
- **Pairing:** pair a stronger AI user with a newer one for one task per sprint
- **Metrics:** track PR cycle time, defect rate and time saved per tool, not just usage

## Staying current after week 26

Keep the daily rhythm; swap the "Watch" day to whatever is new. Follow primary sources rather than hype channels.

- **Vendor release notes (weekly):** Anthropic news and Claude Code changelog, Google AI / Gemini and Antigravity release notes, GitHub Copilot changelog, OpenAI Codex changelog
- **Official YouTube channels:** Anthropic, Google for Developers, Google DeepMind, Kaggle (for each new Intensive), Andrej Karpathy, AI Engineer (conference talks)
- **Practitioner blogs:** [Simon Willison](https://simonwillison.net), [Hamel Husain](https://hamel.dev)
- **Standards to watch:** [agents.md](https://agents.md), [agentskills.io](https://agentskills.io), [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Quarterly:** re-run your tool scorecard and your eval sets against the newest models; update team guidance

A warning for filtering: many "best AI course" lists are written by people selling their own community or course. Prefer courses from model vendors, universities and known practitioners.

## Course library

All free. "Portable" means the lessons apply in any vendor's tools.

| Course | Provider | Phase | Portable? |
| --- | --- | --- | --- |
| [Neural Networks series](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi) | 3Blue1Brown | 1 | Yes |
| [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI) | Andrej Karpathy | 1 | Yes |
| [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) | Andrej Karpathy | 1 (deep track) | Yes |
| [5-Day Gen AI Intensive](https://www.kaggle.com/learn-guide/5-day-genai) | Google + Kaggle | 2–3 | Mostly (Gemini codelabs) |
| [Anthropic Academy](https://anthropic.skilljar.com) | Anthropic | 2–3 | Concepts yes, labs Claude |
| [Antigravity tutorial for beginners](https://www.youtube.com/watch?v=1Q5sWISByuw) | YouTube creator | 2 | Antigravity-specific |
| [Antigravity in 5 minutes](https://www.youtube.com/watch?v=LroJ8KEiTo4) | YouTube creator | 2 | Antigravity-specific |
| [Mastering LLMs open course](https://hamel.dev/blog/posts/course/) | Hamel Husain + practitioners | 3, 5 | Yes |
| [AI Agents Course](https://huggingface.co/learn/agents-course) | Hugging Face | 4 | Yes |
| [5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents) | Google + Kaggle | 4–5 | Mostly (ADK labs) |
| [MCP Course](https://huggingface.co/learn/mcp-course) ([intro video](https://www.youtube.com/watch?v=p4q6LI-2yZ8)) | Hugging Face | 4 | Yes |
| [The MCP Course You Need](https://www.youtube.com/watch?v=uD3wjGy7YL0) | Kubesimplify | 4 | Yes |
| [AI Evals FAQ + talks](https://hamel.dev/blog/posts/evals-faq/) | Hamel Husain, Shreya Shankar | 5 | Yes |

Sources: [Kaggle Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents) · [Kaggle Vibe Coding Intensive 2026](https://www.kaggle.com/competitions/5-day-ai-agents-intensive-vibecoding-course-with-google/discussion/708114) · [Agent Skills adoption](https://strapi.io/blog/what-are-agent-skills-and-how-to-use-them) · [AGENTS.md cross-tool support](https://github.com/eugeniughelbur/agents-md) · [Karpathy course notes](https://github.com/karpathy/nn-zero-to-hero) · [Hamel Husain blog](https://hamel.dev/)
