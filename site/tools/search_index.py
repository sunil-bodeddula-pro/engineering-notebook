#!/usr/bin/env python3
"""Build the site-wide search index: assets/search-index.js.

Run from the site/ folder after adding pages, headings, problems or glossary terms:

    python3 tools/search_index.py            # writes assets/search-index.js
    python3 tools/search_index.py --check    # exits 1 if it is out of date (used in CI)

The index is a small JavaScript file (window.IK_SEARCH = {...}) rather than JSON, so search also works
when pages are opened straight from disk. viz.js loads it the first time someone opens search.

What is indexed (each entry links straight to its place on the page):
  - every page: its title and meta description
  - section headings (h2/h3 with an id), skipping the generic ones every module repeats
  - "up close" technology blocks and "Under the hood" deep dives
  - all coding problems on the pattern pages (number, name, difficulty, company and data-structure tags)
  - glossary terms of every track, linking to that track's glossary
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seo  # noqa: E402  (shares the list of published pages)

OUT = os.path.join("assets", "search-index.js")
GENERIC = {"the idea", "how it works", "try it yourself", "trade-offs", "in real systems", "remember it", "common mistakes",
           "self-check quiz", "go deeper", "say it in the interview", "sources", "product by product", "on this page",
           "the technologies up close", "the numbers up close", "the choices up close", "the tools up close",
           "the interview up close", "how to use this course", "check yourself", "make it stick", "where to go next",
           "practice in order", "the template", "spot it", "what it is", "glossary", "under the hood (optional)"}
TRACK = {"": "Coding", "ai": "AI engineering", "system-design": "System design", "architecture": "Software architecture", "behavioural": "Behavioural", "lld": "Low-level design", "styles": "Architecture styles"}
GLOSS_PAGE = {"coding": "start-here.html#glossary", "ai": "ai/start-here.html#glossary", "system-design": "system-design/start-here.html#glossary", "architecture": "architecture/start-here.html#glossary", "behavioural": "behavioural/start-here.html#glossary", "lld": "lld/start-here.html#glossary", "styles": "styles/start-here.html#glossary"}


def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def clean_title(t):
    t = re.sub(r"\s+[—-]\s+InterviewKata.*$", "", t)
    return re.sub(r"^InterviewKata:\s*", "", t).strip()


def body_of(src):
    i = src.find("<!-- site-chrome:end -->")
    j = src.find("<!-- site-footer:start")
    return src[i if i >= 0 else 0: j if j > 0 else len(src)]


def build():
    os.chdir(ROOT)
    pages, entries = [], []
    for p in seo.pages():
        if p.endswith("review.html"):
            continue
        src = open(p, encoding="utf-8").read()
        title, desc = seo.meta(src)
        track = p.split("/")[0] if p.split("/")[0] in TRACK and "/" in p else ""
        pi = len(pages)
        pages.append([p, clean_title(html.unescape(title)), TRACK[track], html.unescape(desc)])
        body = body_of(src)
        seen = set()
        for tag, hid, h in re.findall(r'<(h[23]) id="([^"]+)"[^>]*>(.*?)</\1>', body, re.S):
            h = re.sub(r'<span class="(?:tgt|badge|tag)[^"]*">.*?</span>', "", h, flags=re.S)   # drop target badges
            label = re.sub(r"^\d+(\.\d+)?\.?\s+", "", text(h))
            low = label.lower()
            if not label or low in GENERIC or low.startswith(("design exercise", "self-check", "practice")) or (hid, label) in seen:
                continue
            seen.add((hid, label)); entries.append([pi, label, hid, "s", ""])
        for sid, name in re.findall(r'<section class="tech" id="([^"]+)">\s*<div class="tech-h"><h3>(.*?)</h3>', body, re.S):
            entries.append([pi, text(name), sid, "t", ""])
        for did, name in re.findall(r'<details class="uth" id="([^"]+)">\s*<summary><span class="uth-t"><b>(.*?)</b>', body, re.S):
            entries.append([pi, text(name), did, "u", ""])
        for pid, summ in re.findall(r'<details class="problem[^"]*"[^>]*?\bid="(p-\d+)"[^>]*>\s*<summary>(.*?)</summary>', body, re.S):
            m = re.search(r"</span>\s*([^<]+?)\s*<", summ)
            if not m:
                continue
            diff = re.search(r'class="tag (easy|medium|hard)"', summ)
            tags = re.findall(r'<span class="[a-z]+tag"[^>]*>([^<]+)</span>', summ) + re.findall(r'<span class="ds">([^<]+)</span>', summ)
            kw = ", ".join(([diff.group(1)] if diff else []) + [t for t in tags if t != "Start here"])
            entries.append([pi, html.unescape(m.group(1)), pid, "p", kw])
    # Headings that repeat across many pages ("Why it matters at work") are structure, not topics: drop them.
    from collections import Counter
    freq = Counter(e[1].lower() for e in entries if e[3] == "s")
    entries = [e for e in entries if e[3] != "s" or freq[e[1].lower()] < 5]
    js = open(os.path.join("assets", "viz.js"), encoding="utf-8").read()
    i = js.index("const GLOSSARY = ["); j = js.index("\n  ];", i)
    gloss = []
    for m in re.finditer(r'^\s*\[("(?:[^"\\]|\\.)*"),\s*(\[[^\]]*\]),\s*("(?:[^"\\]|\\.)*")(?:,\s*"([^"]+)")?\],?\s*$', js[i:j], re.M):
        term, alts, defin, trk = json.loads(m.group(1)), json.loads(m.group(2)), json.loads(m.group(3)), m.group(4) or "coding"
        gid = "#g-" + re.sub(r"[^a-z0-9]+", "-", term.lower())   # glossaryList() gives each term this id
        gloss.append([term, " ".join(alts), defin, GLOSS_PAGE[trk].split("#")[0] + gid, {"coding": "Coding", "ai": "AI engineering", "system-design": "System design", "architecture": "Software architecture", "behavioural": "Behavioural", "lld": "Low-level design", "styles": "Architecture styles"}[trk]])
    return {"v": 1, "pages": pages, "entries": entries, "glossary": gloss}


def render(idx):
    return "/* Generated by tools/search_index.py: the site-wide search index. Do not edit. */\nwindow.IK_SEARCH = " + json.dumps(idx, ensure_ascii=False, separators=(",", ":")) + ";\n"


def main():
    out = render(build())
    path = os.path.join(ROOT, OUT)
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    if "--check" in sys.argv:
        print("search index: up to date" if old == out else "search index: stale, run python3 tools/search_index.py")
        sys.exit(0 if old == out else 1)
    open(path, "w", encoding="utf-8").write(out)
    idx = json.loads(out[out.index("{"): out.rindex("}") + 1])
    print(f"search index: {len(idx['pages'])} pages, {len(idx['entries'])} entries, {len(idx['glossary'])} glossary terms, {len(out) // 1024} KB")


if __name__ == "__main__":
    main()
