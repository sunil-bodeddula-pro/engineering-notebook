#!/usr/bin/env bash
# Assemble the public website (interviewkata.com) into one folder.
# Only the website files are copied; the rest of the notebook is not published.
#
#   site/assemble.sh [OUT_DIR]     (default: _site; run from the repo root)
#
#   /                  algorithms/ pages, patterns/ and assets/
#   /404.html          site/404.html, plus the favicon at /favicon.svg
set -euo pipefail
OUT="${1:-_site}"
rm -rf "$OUT"
mkdir -p "$OUT"
cp algorithms/*.html "$OUT/"
cp -r algorithms/patterns algorithms/assets "$OUT/"
cp site/404.html "$OUT/"
cp algorithms/assets/favicon.svg "$OUT/"
touch "$OUT/.nojekyll"
echo "assembled $(find "$OUT" -name '*.html' | wc -l) pages into $OUT"
