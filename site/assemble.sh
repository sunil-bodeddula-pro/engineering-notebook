#!/usr/bin/env bash
# Assemble the public website (interviewkata.com) into one folder.
# Only the website files are copied; the rest of the notebook is not published.
#
#   site/assemble.sh [OUT_DIR]     (default: _site; run from the repo root)
#
#   /                  site/index.html, site/404.html, the favicon
#   /coding/           algorithms/ pages, patterns/ and assets/
set -euo pipefail
OUT="${1:-_site}"
rm -rf "$OUT"
mkdir -p "$OUT/coding"
cp site/index.html site/404.html "$OUT/"
cp algorithms/assets/favicon.svg "$OUT/"
cp algorithms/*.html "$OUT/coding/"
cp -r algorithms/patterns algorithms/assets "$OUT/coding/"
touch "$OUT/.nojekyll"
echo "assembled $(find "$OUT" -name '*.html' | wc -l) pages into $OUT"
