#!/usr/bin/env python3
"""Search-engine and social-preview tags for every published page.

Run from the site/ folder after adding pages or changing a <title> or meta description:

    python3 tools/seo.py            # writes/updates the block on every page
    python3 tools/seo.py --check    # exits 1 if any page's block is missing or stale (used in CI)

For each page it writes, right after <meta name="description">, a block between
<!-- seo:start --> and <!-- seo:end --> with:
  - a canonical URL on https://interviewkata.com (index.html pages map to their folder URL)
  - Open Graph and Twitter card tags (title, description, URL, the shared preview image)
  - JSON-LD structured data: WebSite + Organization + Course on the home page, Course on the
    track home pages, and a BreadcrumbList (Home > track > page) everywhere else.
The block is derived only from the page's own <title>, description and path, so it never drifts.
robots.txt and sitemap.xml are generated at deploy time by site/assemble.sh.
"""
import glob
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://interviewkata.com"
IMAGE = SITE + "/assets/og-image.png"
TRACKS = {
    "": ("Coding patterns", "/"),
    "ai": ("AI engineering", "/ai/"),
    "system-design": ("System design", "/system-design/"),
}
START, END = "<!-- seo:start -->", "<!-- seo:end -->"


def pages():
    out = [p for p in glob.glob("*.html") if p != "404.html"] + glob.glob("patterns/*.html")
    for t in ("ai", "system-design"):
        out += glob.glob(f"{t}/**/*.html", recursive=True)
    return sorted(out)


def url_of(path):
    p = "/" + path
    return SITE + (p[: -len("index.html")] if p.endswith("/index.html") else p)


def meta(src):
    t = re.search(r"<title>(.*?)</title>", src, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)">', src)
    return (t.group(1).strip() if t else ""), (d.group(1) if d else "")


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + "</script>"


def block(path, title, desc):
    url, plain_t, plain_d = url_of(path), html.unescape(title), html.unescape(desc)
    track = path.split("/")[0] if "/" in path and path.split("/")[0] in TRACKS else ""
    hub = path in ("index.html", "ai/index.html", "system-design/index.html")
    org = {"@type": "Organization", "name": "InterviewKata", "url": SITE + "/", "logo": SITE + "/favicon.svg"}
    tags = [
        f'<link rel="canonical" href="{url}">',
        f'<meta property="og:type" content="{"website" if hub else "article"}">',
        '<meta property="og:site_name" content="InterviewKata">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{desc}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGE}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:image:alt" content="InterviewKata: coding patterns, system design and AI engineering interview prep">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{desc}">',
        f'<meta name="twitter:image" content="{IMAGE}">',
    ]
    if path == "index.html":
        tags.append(ld({"@context": "https://schema.org", "@graph": [
            {"@type": "WebSite", "name": "InterviewKata", "alternateName": "Interview Kata", "url": SITE + "/", "description": plain_d, "inLanguage": "en"},
            org,
            {"@type": "Course", "name": "Coding interview patterns", "description": "24 coding interview patterns with step-through visualizations, templates and solved LeetCode problems.", "url": SITE + "/", "provider": org, "isAccessibleForFree": True, "inLanguage": "en"},
            {"@type": "Course", "name": "System design interview course", "description": "A beginner-to-architect system design course: basics, 29 modules, deep dives into how the technologies work, and 32 worked designs.", "url": SITE + "/system-design/", "provider": org, "isAccessibleForFree": True, "inLanguage": "en"},
            {"@type": "Course", "name": "AI engineering course", "description": "From how LLMs work to agents, MCP, RAG, evals and AI system design.", "url": SITE + "/ai/", "provider": org, "isAccessibleForFree": True, "inLanguage": "en"},
        ]}))
    elif hub:
        tags.append(ld({"@context": "https://schema.org", "@type": "Course", "name": TRACKS[track][0] + " course", "description": plain_d, "url": url, "provider": org, "isAccessibleForFree": True, "inLanguage": "en"}))
    else:
        name, turl = TRACKS[track]
        crumbs = [{"@type": "ListItem", "position": 1, "name": "InterviewKata", "item": SITE + "/"}]
        if track:
            crumbs.append({"@type": "ListItem", "position": 2, "name": name, "item": SITE + turl})
        crumbs.append({"@type": "ListItem", "position": len(crumbs) + 1, "name": re.sub(r"\s+[—-]\s+InterviewKata.*$", "", plain_t), "item": url})
        tags.append(ld({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": crumbs}))
    return START + "\n" + "\n".join(tags) + "\n" + END


def main():
    os.chdir(ROOT)
    check, stale = "--check" in sys.argv, []
    for p in pages():
        src = open(p, encoding="utf-8").read()
        title, desc = meta(src)
        if not title or not desc:
            stale.append(p + " (no title or description)"); continue
        new = block(p, title, desc)
        if START in src:
            i, j = src.index(START), src.index(END) + len(END)
            out = src[:i] + new + src[j:]
        else:
            m = re.search(r'<meta name="description" content="[^"]*">\n?', src)
            out = src[: m.end()] + new + "\n" + src[m.end():]
        if out != src:
            stale.append(p)
            if not check:
                open(p, "w", encoding="utf-8").write(out)
    if check:
        print("seo: all pages up to date" if not stale else "seo: stale or missing on " + ", ".join(stale[:10]) + (" …" if len(stale) > 10 else ""))
        sys.exit(1 if stale else 0)
    print(f"seo: updated {len(stale)} page(s)")


if __name__ == "__main__":
    main()
