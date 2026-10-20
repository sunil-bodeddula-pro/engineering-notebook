#!/usr/bin/env bash
# Assemble the public website (interviewkata.com) into one folder.
# Only the website files are copied; the rest of the notebook is not published.
#
#   site/assemble.sh [OUT_DIR]     (default: _site; run from the repo root)
#
#   /                  algorithms/ pages, patterns/ and assets/
#   /ai/               algorithms/ai/ (the AI engineering track)
#   /system-design/    algorithms/system-design/ (the System design track)
#   /404.html          site/404.html, plus the favicon at /favicon.svg
set -euo pipefail
OUT="${1:-_site}"
rm -rf "$OUT"
mkdir -p "$OUT"
cp algorithms/*.html "$OUT/"
cp -r algorithms/patterns algorithms/assets algorithms/ai algorithms/system-design "$OUT/"
cp site/404.html "$OUT/"
cp algorithms/assets/favicon.svg "$OUT/"
touch "$OUT/.nojekyll"

# robots.txt and sitemap.xml (lastmod = the page's last commit date in algorithms/)
cat > "$OUT/robots.txt" <<'ROBOTS'
User-agent: *
Allow: /
Sitemap: https://interviewkata.com/sitemap.xml
ROBOTS
python3 - "$OUT" <<'PY'
import os, subprocess, sys
out = sys.argv[1]; site = "https://interviewkata.com"; rows = []
for dp, _, fs in os.walk(out):
    for f in fs:
        if not f.endswith(".html") or f == "404.html":
            continue
        rel = os.path.relpath(os.path.join(dp, f), out).replace(os.sep, "/")
        if rel.startswith("assets/"):
            continue
        url = site + "/" + (rel[: -len("index.html")] if rel.endswith("index.html") else rel)
        src = "algorithms/" + rel
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", src], capture_output=True, text=True).stdout.strip()
        depth = rel.count("/")
        prio = "1.0" if rel == "index.html" else "0.9" if rel.endswith("index.html") or rel.endswith("start-here.html") else "0.7" if depth <= 1 else "0.6"
        rows.append((url, d, prio))
rows.sort()
with open(os.path.join(out, "sitemap.xml"), "w") as fh:
    fh.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for url, d, prio in rows:
        fh.write(f"  <url><loc>{url}</loc>" + (f"<lastmod>{d}</lastmod>" if d else "") + f"<priority>{prio}</priority></url>\n")
    fh.write("</urlset>\n")
print(f"sitemap: {len(rows)} URLs")
PY
echo "assembled $(find "$OUT" -name '*.html' | wc -l) pages into $OUT"
