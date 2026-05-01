#!/usr/bin/env python3
"""
Build a single-page HTML viewer for cusoOS.

Generates `cusoOS.html` in the project root. Open it in any browser.
Re-run this script whenever you want the viewer to reflect the latest file state.

Usage:
    python3 build-viewer.py
    open cusoOS.html
"""

import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
OUTPUT = ROOT / "cusoOS.html"

# Ensure markdown is installed
try:
    import markdown
except ImportError:
    print("Installing markdown library (one-time)...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "--user", "--quiet", "markdown"],
        check=True,
    )
    import markdown


def discover_files():
    """Return ordered groups of (group_name, [paths])."""

    def md_files(rel_dir):
        d = ROOT / rel_dir
        if not d.exists():
            return []
        return sorted(p.relative_to(ROOT).as_posix() for p in d.glob("*.md"))

    # Daily files: real plans (YYYY-MM-DD.md) sorted descending, then templates
    daily_all = sorted((ROOT / "daily").glob("*.md")) if (ROOT / "daily").exists() else []
    daily_real = sorted(
        [p.relative_to(ROOT).as_posix() for p in daily_all if not p.stem.startswith("_")],
        reverse=True,
    )
    daily_templates = sorted(
        p.relative_to(ROOT).as_posix() for p in daily_all if p.stem.startswith("_")
    )

    return [
        ("System", ["README.md", "CLAUDE.md", "cross-venture.md"]),
        ("Ventures", md_files("ventures")),
        ("Goals", md_files("goals")),
        ("Daily Plans", daily_real + daily_templates),
        ("Weekly Reviews", md_files("weekly")),
        ("Slash Commands", md_files(".claude/commands")),
        ("Archive", md_files("archive")),
    ]


def slug(path: str) -> str:
    return path.replace("/", "--").replace(".", "-")


def label(path: str) -> str:
    name = Path(path).stem
    if name.startswith("_"):
        name = name[1:] + " (template)"
    return name


def render_markdown(content: str) -> str:
    md = markdown.Markdown(
        extensions=["fenced_code", "tables", "toc", "sane_lists"]
    )
    return md.convert(content)


def build():
    groups = discover_files()

    nav_parts = ['<nav id="sidebar"><h1>cusoOS</h1>']
    main_parts = ['<main id="content">']

    for group_name, files in groups:
        if not files:
            continue
        nav_parts.append(f'<h2>{group_name}</h2><ul>')
        main_parts.append(
            f'<section class="group"><h1 class="group-title">{group_name}</h1>'
        )

        for rel in files:
            path = ROOT / rel
            if not path.exists():
                continue

            anchor = slug(rel)
            nav_parts.append(
                f'<li><a href="#{anchor}">{label(rel)}</a></li>'
            )

            md_text = path.read_text(encoding="utf-8")
            html = render_markdown(md_text)
            main_parts.append(
                f'<article id="{anchor}">'
                f'<div class="filepath">{rel}</div>'
                f'{html}'
                f'</article>'
            )

        nav_parts.append('</ul>')
        main_parts.append('</section>')

    nav_parts.append('</nav>')
    main_parts.append('</main>')

    css = """
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        margin: 0;
        line-height: 1.6;
        color: #1a1a1a;
        background: #fafafa;
        display: flex;
      }
      nav#sidebar {
        width: 280px;
        height: 100vh;
        background: #f0f0f0;
        border-right: 1px solid #ddd;
        padding: 20px;
        overflow-y: auto;
        position: sticky;
        top: 0;
        flex-shrink: 0;
      }
      nav h1 { font-size: 18px; margin-top: 0; color: #222; }
      nav h2 {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #888;
        margin: 18px 0 6px;
      }
      nav ul { list-style: none; padding-left: 0; margin: 0; }
      nav li { margin: 3px 0; }
      nav a {
        color: #0a6cba;
        text-decoration: none;
        font-size: 13px;
        display: block;
        padding: 2px 4px;
        border-radius: 3px;
      }
      nav a:hover { background: #e0e0e0; text-decoration: none; }
      main { flex: 1; padding: 40px 60px; max-width: 900px; }
      .group { margin-bottom: 70px; }
      .group-title {
        font-size: 24px;
        padding-bottom: 8px;
        border-bottom: 2px solid #333;
        margin-bottom: 24px;
      }
      article { margin-bottom: 60px; }
      .filepath {
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        font-size: 11px;
        color: #888;
        background: #eee;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 12px;
      }
      h1, h2, h3, h4 { color: #1a1a1a; }
      article h1 { font-size: 22px; }
      article h2 { font-size: 18px; margin-top: 28px; }
      article h3 { font-size: 16px; margin-top: 22px; }
      code {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        font-size: 0.9em;
      }
      pre {
        background: #f0f0f0;
        padding: 12px 14px;
        border-radius: 6px;
        overflow-x: auto;
      }
      pre code { background: transparent; padding: 0; font-size: 0.85em; }
      table { border-collapse: collapse; margin: 12px 0; }
      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
      th { background: #f0f0f0; }
      blockquote {
        border-left: 4px solid #ccc;
        padding: 4px 16px;
        color: #555;
        margin-left: 0;
        background: #f7f7f7;
      }
      a { color: #0a6cba; }
      hr { border: 0; border-top: 1px solid #ddd; margin: 30px 0; }
      ul li input[type="checkbox"] { margin-right: 6px; }
      @media (max-width: 768px) {
        body { flex-direction: column; }
        nav#sidebar { position: relative; width: 100%; height: auto; }
        main { padding: 24px; }
      }
    """

    html = (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '<title>cusoOS</title>\n'
        f'<style>{css}</style>\n'
        '</head>\n'
        '<body>\n'
        f'{"".join(nav_parts)}\n'
        f'{"".join(main_parts)}\n'
        '</body>\n'
        '</html>\n'
    )

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"✓ Generated {OUTPUT}")
    print(f"  Open with: open {OUTPUT}")


if __name__ == "__main__":
    build()
