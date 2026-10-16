# InterviewKata: coding patterns

Live at [interviewkata.com](https://interviewkata.com). An offline, interactive course that takes you from zero to pro at the 24 coding-interview patterns.

## Open it

Double-click **`index.html`**. It opens in any browser straight from disk. No server, no install, no internet needed.

## New to coding interviews?

1. Open **`start-here.html`** for the foundations the pattern pages assume: Big-O, data structures, recursion and the Python you'll type. Skip what you already know.
2. Follow the **beginner path** on `index.html`: the 24 patterns in the order to learn them, each with its first problems.
3. On each pattern page, solve the problems marked **★ Start here** first (the gentlest 2–3, also listed at the top of section 7).
4. Hover or tap any **dotted word** (memoization, in-degree, amortised, …) for a one-line definition; they're all in the glossary on `start-here.html`.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | Home page: **beginner path**, pattern map, memory palace, **interactive pattern finder**, 6-step problem-solving method, 8-week study plan |
| `start-here.html` | **Foundations for beginners**: Big-O (with an interactive "is it fast enough?" slider), the core data structures and what they cost, recursion and the call stack, the Python toolkit, how to read a LeetCode problem, a first problem walked through, a quiz and the glossary |
| `patterns/01-…24-*.html` | One page per pattern, all with the same 10 sections (below) and step-through visualizers |
| `cheatsheet.html` | One-page printable revision sheet: signals, hook, template and complexity for all 24 |
| `google.html`, `meta.html`, `amazon.html`, `microsoft.html`, `apple.html`, `nvidia.html`, `cisco.html`, `netflix.html` | **Company interview lists**: all problems from Google's (785), Meta's (377), Amazon's (725), Microsoft's (411), Apple's (69) and Nvidia's (19) six-month LeetCode lists and Cisco's (88) and Netflix's (29) all-time lists, grouped by pattern, with frequency, search and difficulty filters, a per-browser "done" checklist and a 6-month study plan |
| `ai/index.html`, `ai/start-here.html`, `ai/modules/*.html` | **The AI engineering track** (served at `interviewkata.com/ai/`): 20 modules from how LLMs work to agents, MCP, skills, RAG, evals, security, cost and choosing tools, each with the same 10 sections, flow diagrams, step-through players, interactive widgets and labs in Claude Code, Antigravity CLI, Copilot, Cursor and Codex. All 20 modules are built. Pages use `<body data-track="ai">` so the glossary shows AI terms |
| `system-design/index.html`, `system-design/start-here.html`, `system-design/modules/*.html`, `system-design/designs/*.html` | **The System design track** (served at `interviewkata.com/system-design/`): 29 modules in five levels, from how a request travels to replication, sharding, consensus, workflows, reliability and AI systems, plus 24 worked designs. Each module has the same 10 sections with flow diagrams, step-through players, interactive widgets and a design exercise. All 29 modules and all 24 worked designs are live; every design uses the long form (a full 60–90 minute interview). Animated scenes, D3 labs and guided tours load GSAP, D3 and Driver.js from jsDelivr and fall back to plain players offline. Pages use `<body data-track="system-design">` |
| `review.html`, `ai/review.html`, `system-design/review.html` | **Review decks**: every quiz question and memory hook of a track as spaced-repetition flashcards, with progress saved in the browser. Rebuilt by `tools/build_review.py` |
| `assets/` | Source CSS and the small visualizer engine (plain JS). Every page already contains a copy of both, so **any single HTML file works on its own** (email it, move it, open it offline) |
| `assets/nav.json` | The site menus: the top bar lists the tracks, the left sidebar lists the current track's pages. Edit it and run the inline tool |
| `tools/inline_assets.py` | If you edit `assets/`, run `python3 tools/inline_assets.py` to refresh the copy inside every page |

Every problem on every page, including each problem in the practice list, is solved **inside the HTML**: the problem, why the pattern fits, numbered approach steps, commented Python code and complexity.

Every problem is also tagged with the **data structures** it is built on (Array, String, Hash Map, Linked List, Binary Tree, Heap, Graph, …): look for the small grey chips next to each problem title and in the "Data structure" column of every practice list.

The practice lists cover every LeetCode problem from the YouTube playlist [Data Structures & Algorithms in Python – The Complete Pathway](https://www.youtube.com/playlist?list=PLKYEe2WisBTFEr6laH5bR2J19j7sl5O8R), each sorted into the pattern it belongs to.

Every Medium and Hard Python problem on **Google's, Meta's, Amazon's, Microsoft's, Apple's and Nvidia's six-month interview lists, and Cisco's and Netflix's all-time lists,** (from [leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems), see [Sources](#sources)) is solved on its pattern page too, marked with a **Google**, **Meta**, **Amazon**, **Microsoft**, **Apple**, **Nvidia**, **Cisco** or **Netflix** badge. Each one says which pattern to choose and why (and why not the obvious alternatives), gives hints, the brute-force-to-pattern bridge, edge cases, and the official LeetCode examples and constraints.

Under every solution there is a **Step through the solution** player: it runs that exact Python code on a LeetCode example and lets you step line by line, watching the variables, arrays, grids and the call stack change.

### The 10 sections on every pattern page
1. **What it's for**: plain English, with a real-world analogy
2. **How it works**: broken into numbered steps, plus interactive visualizations
3. **How to spot it**: trigger words, input shape, "the one question to ask"
4. **When (not) to use it**: compared with neighbouring patterns, plus complexity
5. **Python template** to memorize
6. **How to remember it**: memory hook, mental picture, chant
7. **LeetCode problems**: mostly Medium and Hard, solved step by step
8. **Common mistakes**
9. **Self-check quiz**
10. **Practice list**, ordered from easy to hard

## Visualizer controls
Click inside a visualizer, then use <kbd>←</kbd> / <kbd>→</kbd> to step and <kbd>Space</kbd> to play or pause. You can also drag the slider.

## The 24 memory hooks
| # | Pattern | Hook |
|---|---|---|
| 01 | Prefix Sum | Odometer minus odometer |
| 02 | Two Pointers | Squeeze from both ends |
| 03 | Sliding Window | Caterpillar: stretch, then pull the tail |
| 04 | Fast & Slow Pointers | Tortoise and hare on a running track |
| 05 | LinkedList Reversal | Save next, point back, step forward |
| 06 | Monotonic Stack | Taller person blocks the view |
| 07 | Top K Elements | A VIP room with only k seats |
| 08 | Overlapping Intervals | Sort by start, glue if they touch |
| 09 | Modified Binary Search | Guess the number: higher or lower? |
| 10 | Binary Tree Traversal | Pre = me first, In = me middle, Post = me last |
| 11 | DFS | Maze runner: keep one hand on the wall |
| 12 | BFS | Ripples in a pond |
| 13 | Matrix Traversal | Every cell is a node; neighbours are N/E/S/W |
| 14 | Backtracking | Choose, explore, un-choose |
| 15 | Dynamic Programming | Backtracking with a memory |
| 16 | Hash Map & Set | Coat check: hang it once, find it instantly |
| 17 | Stack | Plates in the cafeteria |
| 18 | Greedy | Biggest coin that fits |
| 19 | Trie & Design | Thumb index + two-tool belt |
| 20 | Shortest Path & MST | Closest unvisited city next |
| 21 | Array & String Basics | The careful clerk |
| 22 | Math & Bit Manipulation | Square and skip |
| 23 | Union-Find | Ask the boss |
| 24 | Segment Tree & Fenwick Tree | Up by the low bit, down by the low bit |

## Sources

- **[liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems)**: a community-maintained GitHub repository that collects the LeetCode problems companies have asked in interviews. Each company has its own folder of CSV files, one per time window, and each row lists a problem's difficulty, title, frequency, acceptance rate, LeetCode link and topics. The company lists here use the **six-month** file (`3. Six Months.csv`) for [Google](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Google/3.%20Six%20Months.csv), [Meta](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Meta/3.%20Six%20Months.csv), [Amazon](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Amazon/3.%20Six%20Months.csv), [Microsoft](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Microsoft/3.%20Six%20Months.csv), [Apple](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Apple/3.%20Six%20Months.csv) and [Nvidia](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Nvidia/3.%20Six%20Months.csv); for Cisco and Netflix it uses the **all-time** file (`5. All.csv`: [Cisco](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Cisco/5.%20All.csv), [Netflix](https://github.com/liquidslr/leetcode-company-wise-problems/blob/main/Netflix/5.%20All.csv)). The difficulty, frequency and topics shown on `google.html`, `meta.html`, `amazon.html`, `microsoft.html`, `apple.html`, `nvidia.html`, `cisco.html` and `netflix.html` come from those files, as downloaded in October 2026; the lists change over time, so re-check the repository for the latest version.
- **[LeetCode](https://leetcode.com/)**: the official problem statements, examples and constraints quoted on each problem, and the examples every solution is tested against.
- **[Data Structures & Algorithms in Python – The Complete Pathway](https://www.youtube.com/playlist?list=PLKYEe2WisBTFEr6laH5bR2J19j7sl5O8R)** (YouTube playlist): the problems in the practice lists, and the video links shown next to them.

## Hosting it as a website (free)

The course is plain static files (HTML, CSS and JS, with no server code), so any static host can serve it. The only thing you pay for is your domain.

### Options

| Option | Cost | HTTPS on a custom domain | Notes |
|---|---|---|---|
| GCS bucket website alone | ~$0 | ❌ HTTP only | Pointing a custom domain at a bucket website (CNAME → `c.storage.googleapis.com`) gives you no HTTPS |
| GCS + Cloud Load Balancer | ~$18+/month (forwarding rule) | ✅ Google-managed cert | Reliable, but not free |
| GCS + Cloudflare (free plan) as a proxy | $0 | ✅ Cloudflare cert | You manage DNS in Cloudflare |
| **Firebase Hosting (Spark / free plan)** | $0 at this size (10 GB storage, 360 MB/day transfer) | ✅ free automatic SSL | **Recommended.** Includes a global CDN and custom-domain support |

### Recommended: Firebase Hosting

**Shortcut:** run `bash deploy-firebase.sh <firebase-project-id>` (add `--preview` to get a 7-day preview URL instead). The script creates `firebase.json` if it's missing, makes sure you're logged in, and deploys. The manual steps are:

```bash
npm install -g firebase-tools
firebase login
cd ~/Downloads/coding-patterns-mastery
firebase init hosting
#   Public directory?                       .
#   Configure as a single-page app?         No
#   Overwrite index.html?                   No
firebase deploy
# The site goes live at https://<project-id>.web.app
```

To stop source and tooling files from being published, put an `ignore` list in `firebase.json`:

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/__pycache__/**", "tools/**", "README.md"]
  }
}
```

**Custom domain:** in the Firebase Console, go to *Hosting → Add custom domain*. Then add the TXT and A records it shows you at your domain registrar. Firebase provisions the SSL certificate automatically.

### Alternative: GCS bucket only (HTTP)

```bash
# The bucket name must match the domain, and the domain must be verified in Google Search Console
gcloud storage buckets create gs://learn.yourdomain.com --location=us-central1 --uniform-bucket-level-access
gcloud storage cp -r ~/Downloads/coding-patterns-mastery/* gs://learn.yourdomain.com
gcloud storage buckets update gs://learn.yourdomain.com --web-main-page-suffix=index.html
gcloud storage buckets add-iam-policy-binding gs://learn.yourdomain.com \
  --member=allUsers --role=roles/storage.objectViewer
```

DNS record at your registrar: `CNAME learn → c.storage.googleapis.com.`

- Use a US region (`us-central1`, `us-east1` or `us-west1`) to stay inside the Always Free tier.
- Network egress beyond the free tier costs a few cents per GB.
- If you need HTTPS, put Cloudflare (free) in front of the bucket, or use Firebase instead.

### Notes
- Don't upload `tools/` or `README.md`; they aren't needed to view the site.
- Use a **personal** GCP or Firebase project, not a corporate one.
- Free-tier limits and prices change over time. Check the current [Firebase pricing](https://firebase.google.com/pricing) and [Cloud Storage pricing](https://cloud.google.com/storage/pricing) pages before you deploy.

