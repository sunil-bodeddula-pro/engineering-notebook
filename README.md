# engineering-notebook

My engineering notebook: notes, playbooks and a daily learning log across AI engineering, system
design, algorithms and programming languages.

## Topics

| Folder | What it covers | Start with |
| --- | --- | --- |
| [`ai-engineering/`](ai-engineering/) | Using AI tools well — product development with agents, integrations (MCP), plugins, skills, automation, security — and leading a team's adoption | [The roadmap and handbook](ai-engineering/AI-Engineering-Leadership-Roadmap.md) |
| [`system-design/`](system-design/) | Building blocks, trade-offs and worked designs of real systems (the source notes for the [System design track](algorithms/system-design/)) | [Topic map](system-design/README.md#topics) |
| [`algorithms/`](algorithms/) | Patterns, data structures and solved problems, written around the key insight | [Pattern list](algorithms/README.md#patterns-to-cover) |
| [`languages/`](languages/) | Idioms, internals and gotchas — Kotlin, TypeScript, Dart and more | [Languages](languages/README.md#languages) |
| [`templates/`](templates/) | Ready-to-copy templates for every kind of note | [All templates](templates/README.md) |

## Website: [interviewkata.com](https://interviewkata.com)

The interview-prep material is published as a website. Every push to `main` that touches `site/` or
`algorithms/` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which builds the site with
[`site/assemble.sh`](site/assemble.sh) and deploys it to GitHub Pages. Only the website files are published:

| URL | Source |
| --- | --- |
| `interviewkata.com/` | [`algorithms/`](algorithms/) pages, `patterns/` and `assets/` |
| `interviewkata.com/ai/` | [`algorithms/ai/`](algorithms/ai/): the AI engineering track |
| `interviewkata.com/system-design/` | [`algorithms/system-design/`](algorithms/system-design/): the System design track |
| `interviewkata.com/404.html` | [`site/404.html`](site/404.html) |

To preview locally: `site/assemble.sh /tmp/site && python3 -m http.server -d /tmp/site 8000`.

## Current focus

| Topic | Now | Next |
| --- | --- | --- |
| AI engineering | Phase 1 — the basics of how AI works (weeks 1–2) | Phase 2 — AI-assisted development |
| System design | Website track: all 29 modules and 24 worked designs published, all in the long form | Add scenes and tours to the 29 modules |
| Algorithms | — | Arrays and strings patterns |
| Languages | — | Kotlin coroutines |

*Update this table when the focus changes.*

## How this notebook works

1. **Log every session** in [`LEARNING.md`](LEARNING.md) — one line: date · topic · what · link. One log for all topics, so progress is visible in one place.
2. **Distil into the topic folder** using a template from [`templates/`](templates/). Write the insight and why it works, not a copy of the source.
3. **Revisit.** Algorithm problems get re-solved after 1 week and 1 month; notes get a pass when a related topic comes up.
4. **Promote what matures.** When a folder is good enough to share (the AI handbook first), copy a cleaned version into a team or public repo. This one stays private.

## Daily rhythm (30 minutes, five days a week)

| Day | Activity |
| --- | --- |
| Monday | Watch or read one lesson |
| Tuesday | Build or solve something with it |
| Wednesday | Cross-check (a second tool, a second approach, a second language) |
| Thursday | Read release notes, an engineering blog or a paper |
| Friday | Teach it — a short share-out, or a polished note |

## Conventions

- File names are lowercase with hyphens: `sliding-window.md`, `url-shortener.md`.
- Every note has a **date**; anything about a tool or library also has its **version**.
- Links to sources go in the note, not just in the log.
- Code examples are minimal and runnable.
