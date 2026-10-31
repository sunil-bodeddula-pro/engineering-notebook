#!/usr/bin/env python3
"""Build the spaced-repetition review deck for each track from the quizzes and memory hooks on its pages.

Run from the site/ folder after adding or editing quiz questions or memory hooks:

    python3 tools/build_review.py          # writes review.html, ai/review.html, system-design/review.html, architecture/review.html, behavioural/review.html, lld/review.html
    python3 tools/build_review.py --check  # exit 1 if any deck is out of date (CI runs this)
    python3 tools/inline_assets.py         # then fill in the shared CSS/JS, menus and footer

Each card is one quiz question (question, options, answer, explanation) or one memory hook.
Cards are identified by a hash of their page and text, so a learner's progress (kept in their
browser's localStorage) survives rebuilds as long as the question text doesn't change.
"""
import glob
import hashlib
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TRACKS = {
    "coding": {"out": "review.html", "label": "Coding patterns", "pages": ["start-here.html", "cheatsheet.html", "structures/*.html", "patterns/*.html"]},
    "ai": {"out": "ai/review.html", "label": "AI engineering", "pages": ["ai/start-here.html", "ai/modules/*.html", "ai/cases/*.html"]},
    "system-design": {"out": "system-design/review.html", "label": "System design", "pages": ["system-design/start-here.html", "system-design/framework.html", "system-design/modules/*.html", "system-design/designs/*.html"]},
    "behavioural": {"out": "behavioural/review.html", "label": "Behavioural interviews", "pages": ["behavioural/start-here.html", "behavioural/modules/*.html"]},
    "styles": {"out": "styles/review.html", "label": "Architecture styles", "pages": ["styles/start-here.html", "styles/modules/*.html"]},
    "design-patterns": {"out": "design-patterns/review.html", "label": "Design patterns", "pages": ["design-patterns/start-here.html", "design-patterns/modules/*.html"]},
    "lld": {"out": "lld/review.html", "label": "Low-level design", "pages": ["lld/start-here.html", "lld/modules/*.html", "lld/problems/*.html"]},
    "architecture": {"out": "architecture/review.html", "label": "Software architecture", "pages": ["architecture/start-here.html", "architecture/modules/*.html", "architecture/cases/*.html"],
                     "note": 'Topics follow Mark Richards\' <a href="https://www.youtube.com/playlist?list=PLdsOZAx8I5umhnn5LLTNJbFgwA3xbycar" target="_blank" rel="noopener">Software Architecture Monday</a> lessons; the cards and pages are original.'},
}

QUIZ = re.compile(r'<div class="quiz-q" data-answer="([^"]*)">\s*<p>(.*?)</p>\s*<div class="opts">(.*?)</div>\s*<div class="why">(.*?)</div>', re.S)
HOOK = re.compile(r'<div class="callout memory"><strong>Memory hook: (.*?)</strong>(.*?)</div>', re.S)
BUTTON = re.compile(r"<button[^>]*>(.*?)</button>", re.S)


def body_of(src):
    """Only the hand-written part of the page (after the menus), so inlined assets are never scanned."""
    i = src.find("<!-- site-chrome:end -->")
    return src[i:] if i >= 0 else src


def title_of(src, path):
    m = re.search(r"<h1>(.*?)</h1>", src, re.S)
    t = re.sub(r"<[^>]+>", "", m.group(1)) if m else os.path.basename(path)
    return html.unescape(" ".join(t.split()))


def card_id(*parts):
    return hashlib.sha1("|".join(parts).encode()).hexdigest()[:12]


def cards_for(track):
    cfg = TRACKS[track]
    base = os.path.dirname(cfg["out"])
    files = []
    for pat in cfg["pages"]:
        files += sorted(glob.glob(pat, root_dir=ROOT))
    cards, topics = [], []
    for f in files:
        with open(os.path.join(ROOT, f), encoding="utf-8") as fh:
            src = fh.read()
        body = body_of(src)
        rel = os.path.relpath(f, base or ".").replace(os.sep, "/")
        title = title_of(body, f)
        n0 = len(cards)
        for m in HOOK.finditer(body):
            hook = " ".join(m.group(1).split())
            cards.append({"id": card_id(rel, "hook", hook), "t": rel, "k": "hook",
                          "q": f"What's the memory hook for <b>{html.escape(title)}</b>, and what does it mean?",
                          "a": hook, "w": " ".join(m.group(2).split())})
        for m in QUIZ.finditer(body):
            answer, q, opts, why = m.group(1), " ".join(m.group(2).split()), m.group(3), " ".join(m.group(4).split())
            options = [" ".join(o.split()) for o in BUTTON.findall(opts)]
            cards.append({"id": card_id(rel, "quiz", q), "t": rel, "k": "quiz", "q": q, "o": options,
                          "a": html.escape(html.unescape(answer)), "w": why})
        if len(cards) > n0:
            topics.append({"t": rel, "name": title, "n": len(cards) - n0})
    return cards, topics


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Review deck: __LABEL__ — InterviewKata</title>
<meta name="description" content="Spaced-repetition review for the __LABEL__ track: every quiz question and memory hook as a flashcard; the ones you find hard come back sooner.">
<!-- inline-assets:start (generated by tools/inline_assets.py from assets/) -->
<!-- inline-assets:end -->
<style>
  .rv-card { min-height: 260px; display: grid; gap: 12px; align-content: start; }
  .rv-meta { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; font-size: .82rem; color: var(--ink-3); }
  .rv-q { font-size: 1.15rem; font-weight: 600; line-height: 1.5; }
  .rv-opts { display: grid; gap: 6px; padding: 0; margin: 0; list-style: none; }
  .rv-opts li { padding: 8px 12px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); }
  .rv-opts li.right { border-color: var(--green); background: var(--green-soft); font-weight: 600; }
  .rv-ans { display: none; padding: 12px 14px; border-radius: 10px; background: var(--accent-soft); }
  .rv-card.revealed .rv-ans { display: block; }
  .rv-ans b.big { display: block; font-size: 1.05rem; margin-bottom: 4px; }
  .rv-grade { display: none; flex-wrap: wrap; gap: 8px; }
  .rv-card.revealed .rv-grade { display: flex; }
  .rv-card.revealed .rv-show { display: none; }
  .rv-grade button small { display: block; font-size: .72rem; color: var(--ink-3); font-weight: 500; }
  .rv-done { text-align: center; padding: 30px 10px; }
  .rv-bar { height: 8px; border-radius: 999px; background: var(--surface-2); overflow: hidden; }
  .rv-bar i { display: block; height: 100%; background: var(--accent); transition: width .3s; }
</style>
</head>
<body data-track="__TRACK__">
<!-- site-chrome:start (generated by tools/inline_assets.py from assets/nav.json) -->
<!-- site-chrome:end -->
<div class="page">
  <aside class="toc">
    <h4>On this page</h4>
    <ol>
      <li><a href="#review">1. Review now</a></li>
      <li><a href="#how">2. How it works</a></li>
      <li><a href="#topics">3. Cards by topic</a></li>
    </ol>
  </aside>
  <main>
    <div class="eyebrow">__LABEL__ · Review deck</div>
    <h1>Review deck: __LABEL__</h1>
    <p class="lede">Every quiz question and memory hook in this track, as flashcards. Answer in your head, reveal, then say how well you knew it. Cards you find hard come back soon; cards you know well wait days, then weeks. Ten minutes a day keeps everything you've learned within reach.</p>

    <h2 id="review">1. Review now</h2>
    <div class="card widget" id="rv">
      <div class="ctl"><label for="rv-topic">Topic</label><select id="rv-topic"></select><label for="rv-new">New cards per session</label><select id="rv-new"><option>5</option><option selected>10</option><option>20</option><option value="999">all</option></select></div>
      <div class="tiles no-gl" id="rv-stats"></div>
      <div class="rv-bar" aria-hidden="true"><i id="rv-prog" style="width:0"></i></div>
      <div class="rv-card no-gl" id="rv-card" aria-live="polite"></div>
    </div>
    <p class="idx">Keys: <kbd>space</kbd> reveals the answer; <kbd>1</kbd>–<kbd>4</kbd> grade it. Progress is saved in this browser only (nothing is sent anywhere); clearing site data resets it.</p>

    <h2 id="how">2. How it works</h2>
    <p>This is <strong>spaced repetition</strong>: reviewing just before you'd forget is the most efficient way to make knowledge stick. Each card sits in a box from 0 to 6. "Good" moves it up a box and schedules it further out (1, 3, 7, 16, 35, then 90 days); "Easy" jumps two boxes; "Hard" keeps it in its box and brings it back sooner; "Again" sends it back to box 0 and shows it again in this session. A card counts as <em>learned</em> from box 3.</p>
    <div class="grid-3">
      <div class="card"><h3>Say it before you reveal</h3><p>Answer out loud or on paper first. Recognising the answer after seeing it feels like knowing it, but isn't.</p></div>
      <div class="card"><h3>Little and often</h3><p>Ten minutes daily beats an hour on Sunday. The schedule only works if you come back when cards are due.</p></div>
      <div class="card"><h3>Go back to the page</h3><p>Every card links to its page. If you keep missing one, reread that section and run its visualizer again.</p></div>
    </div>

    <h2 id="topics">3. Cards by topic</h2>
    <table class="no-gl"><thead><tr><th>Topic</th><th>Cards</th><th>Learned</th><th></th></tr></thead><tbody id="rv-topics"></tbody></table>
    <p><button class="btn" type="button" id="rv-reset">Reset my progress for this track</button></p>
  </main>
</div>
<footer class="site">
<!-- site-footer:start (generated by tools/inline_assets.py from assets/footer.html) -->
<!-- site-footer:end -->
<p class="foot-note">Generated by tools/build_review.py from the quizzes and memory hooks on __COUNT__ pages.__NOTE__</p>
</footer>
<script type="application/json" id="rv-deck">__DECK__</script>
<script>
(function () {
  const $ = (id) => document.getElementById(id);
  const { cards, topics } = JSON.parse($("rv-deck").textContent);
  const KEY = "ik-review-v1-__TRACK__", DAY = 864e5, INT = [0, 1, 3, 7, 16, 35, 90];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private mode: progress lasts this visit */ } };
  let st = load(), queue = [], done = 0, total = 0;
  const byTopic = Object.fromEntries(topics.map((t) => [t.t, t.name]));
  const params = new URLSearchParams(location.search);
  $("rv-topic").innerHTML = `<option value="">All topics (${cards.length} cards)</option>` + topics.map((t) => `<option value="${t.t}">${Viz.esc(t.name)} (${t.n})</option>`).join("");
  if (params.get("topic") && byTopic[params.get("topic")]) $("rv-topic").value = params.get("topic");
  const now = () => Date.now();
  const inTopic = (c) => !$("rv-topic").value || c.t === $("rv-topic").value;
  function stats() {
    const pool = cards.filter(inTopic);
    const seen = pool.filter((c) => st[c.id]), due = seen.filter((c) => st[c.id].due <= now());
    const learned = seen.filter((c) => st[c.id].box >= 3).length;
    $("rv-stats").innerHTML = `<div><b>${due.length}</b><span>due now</span></div><div><b>${pool.length - seen.length}</b><span>new</span></div><div><b>${learned}</b><span>learned</span></div><div><b>${pool.length}</b><span>cards here</span></div>`;
    $("rv-topics").innerHTML = topics.map((t) => { const cs = cards.filter((c) => c.t === t.t), l = cs.filter((c) => st[c.id] && st[c.id].box >= 3).length; return `<tr><td><a href="${t.t}">${Viz.esc(t.name)}</a></td><td>${cs.length}</td><td>${l}</td><td><a href="?topic=${encodeURIComponent(t.t)}#review">review</a></td></tr>`; }).join("");
  }
  function build() {
    const pool = cards.filter(inTopic), nNew = +$("rv-new").value;
    const due = pool.filter((c) => st[c.id] && st[c.id].due <= now()).sort((a, b) => st[a.id].due - st[b.id].due);
    const fresh = pool.filter((c) => !st[c.id]).slice(0, nNew);
    queue = [...due, ...fresh]; done = 0; total = queue.length;
    stats(); show();
  }
  function show() {
    $("rv-prog").style.width = total ? (done / total * 100) + "%" : "0";
    const c = queue[0], el = $("rv-card");
    el.classList.remove("revealed");
    if (!c) {
      const next = cards.filter(inTopic).filter((x) => st[x.id]).map((x) => st[x.id].due).sort((a, b) => a - b)[0];
      el.innerHTML = `<div class="rv-done"><h3>All caught up${total ? ` · ${total} card${total > 1 ? "s" : ""} reviewed` : ""}</h3><p>${next ? `Next card due ${new Date(next).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.` : "Pick more new cards above, or another topic."}</p></div>`;
      return;
    }
    const s = st[c.id], label = s ? `box ${s.box}` : "new card";
    const opts = c.o ? `<ul class="rv-opts">${c.o.map((o) => `<li class="${o === c.a ? "r" : ""}">${o}</li>`).join("")}</ul>` : "";
    el.innerHTML = `<div class="rv-meta"><span>${c.k === "hook" ? "Memory hook" : "Quiz"} · <a href="${c.t}">${Viz.esc(byTopic[c.t] || c.t)}</a></span><span>${label} · ${queue.length} left</span></div>
      <div class="rv-q">${c.q}</div>${opts}
      <button class="btn primary rv-show" type="button" id="rv-show">Show answer <small>(space)</small></button>
      <div class="rv-ans"><b class="big">${c.a}</b>${c.w}</div>
      <div class="rv-grade">${[["again", "Again", "see it again now"], ["hard", "Hard", "soon"], ["good", "Good", "later"], ["easy", "Easy", "much later"]].map(([g, l, d], i) => `<button class="btn${g === "good" ? " primary" : ""}" type="button" data-g="${g}">${i + 1} · ${l}<small>${d}</small></button>`).join("")}</div>`;
    $("rv-show").addEventListener("click", reveal);
  }
  function reveal() {
    const el = $("rv-card"); if (!queue[0] || el.classList.contains("revealed")) return;
    el.classList.add("revealed");
    el.querySelectorAll(".rv-opts li.r").forEach((li) => li.classList.add("right"));
  }
  function grade(g) {
    const c = queue[0]; if (!c || !$("rv-card").classList.contains("revealed")) return;
    const s = st[c.id] || { box: 0, due: 0 };
    if (g === "again") { s.box = 0; s.due = now() + 10 * 60e3; queue.push(c); }
    else if (g === "hard") { s.box = Math.max(1, s.box); s.due = now() + Math.max(1, INT[s.box] / 2) * DAY; done++; }
    else { s.box = Math.min(6, s.box + (g === "easy" ? 2 : 1)); s.due = now() + INT[s.box] * DAY; done++; }
    st[c.id] = s; save(); queue.shift(); if (g === "again") total++; stats(); show();
  }
  $("rv-card").addEventListener("click", (e) => { const b = e.target.closest("button[data-g]"); if (b) grade(b.dataset.g); });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input, select, textarea")) return;
    if (e.key === " " && queue[0] && !$("rv-card").classList.contains("revealed")) { reveal(); e.preventDefault(); }
    const g = { 1: "again", 2: "hard", 3: "good", 4: "easy" }[e.key]; if (g) grade(g);
  });
  ["rv-topic", "rv-new"].forEach((id) => $(id).addEventListener("input", build));
  $("rv-reset").addEventListener("click", () => { if (confirm("Reset your review progress for this track? This can't be undone.")) { st = {}; save(); build(); } });
  build();
})();
</script>
</body>
</html>
"""


def main():
    check, stale = "--check" in sys.argv, []
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import pagegen
    for track, cfg in TRACKS.items():
        cards, topics = cards_for(track)
        if not topics:
            continue   # a track that has no pages yet gets no deck
        deck = json.dumps({"cards": cards, "topics": topics}, ensure_ascii=False).replace("</", "<\\/")
        out = PAGE.replace("__LABEL__", cfg["label"]).replace("__TRACK__", track).replace("__COUNT__", str(len(topics))).replace("__DECK__", deck).replace("__NOTE__", " " + cfg["note"] if cfg.get("note") else "")
        if not pagegen.write_or_check(cfg["out"], out, check):
            stale.append(cfg["out"])
        if not check:
            print(f"{cfg['out']}: {len(cards)} cards from {len(topics)} pages")
    if check:
        print("review decks: up to date" if not stale else "review decks: stale: " + ", ".join(stale))
        sys.exit(1 if stale else 0)


if __name__ == "__main__":
    main()
