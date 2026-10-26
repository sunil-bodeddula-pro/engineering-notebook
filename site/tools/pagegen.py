"""Shared finishing step for generated pages (review decks, cheat sheets).

finish(rel_path, html) keeps the blocks that inline_assets.py already filled in (assets, menus, footer) from the page on
disk, and applies the search/social tags from seo.py, so a freshly generated page is byte-identical to a published one
when nothing changed. write_or_check() then writes it, or in --check mode only reports whether it differs.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seo  # noqa: E402

BLOCKS = [("<!-- inline-assets:start", "<!-- inline-assets:end -->"), ("<!-- site-chrome:start", "<!-- site-chrome:end -->"),
          ("<!-- site-footer:start", "<!-- site-footer:end -->")]


def finish(rel, out):
    path = os.path.join(ROOT, rel)
    if os.path.exists(path):
        old = open(path, encoding="utf-8").read()
        for a, b in BLOCKS:
            i, j = old.find(a), old.find(b)
            k, l = out.find(a), out.find(b)
            if i >= 0 and j >= 0 and k >= 0 and l >= 0:
                out = out[:k] + old[i:j] + out[l:]
    title, desc = seo.meta(out)
    block = seo.block(rel, title, desc)
    if seo.START in out:
        i, j = out.index(seo.START), out.index(seo.END) + len(seo.END)
        out = out[:i] + block + out[j:]
    else:
        m = re.search(r'<meta name="description" content="[^"]*">\n?', out)
        out = out[: m.end()] + block + "\n" + out[m.end():]
    return out


def write_or_check(rel, out, check):
    """Returns True if the page on disk is already up to date."""
    path = os.path.join(ROOT, rel)
    out = finish(rel, out)
    same = os.path.exists(path) and open(path, encoding="utf-8").read() == out
    if not same and not check:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w", encoding="utf-8").write(out)
    return same
