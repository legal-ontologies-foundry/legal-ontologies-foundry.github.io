"""MkDocs hook: on each principle page, show the open proposal that would change or ratify it.

scripts/build_activity.py records, in build/principle-decisions.json, which open pull requests change
which principle pages, and the state of each decision. This hook adds a box under the page title with
that proposal, links to comment on it with or without GitHub, and, once it is open for decision, the
voting panel for signed-in members (docs/javascripts/lof-members.js).
"""
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

import yaml

ROOT = Path(__file__).resolve().parent.parent
STATUS = ROOT / "build" / "principle-decisions.json"
FORMS = ROOT / "community" / "forms.yml"
PAGE = re.compile(r"(^|/)principles/(lof-p-[^/]+\.md)$")


def _load():
    try:
        status = json.loads(STATUS.read_text())
    except (FileNotFoundError, ValueError):
        status = {}
    try:
        forms = yaml.safe_load(FORMS.read_text()) or {}
    except FileNotFoundError:
        forms = {}
    return status, forms


def _comment_link(forms, url):
    if not (forms.get("form_url") and forms.get("prefill") and forms.get("actions")):
        return None
    return (f"{forms['form_url']}?usp=pp_url&{forms['prefill']['action']}={quote(forms['actions']['comment'])}"
            f"&{forms['prefill']['link']}={quote(url)}")


def box(entries, forms):
    out = []
    for e in entries:
        title, url = html.escape(e["title"]), e["url"]
        links = f"[comment on GitHub]({url})"
        own = _comment_link(forms, url)
        if own:
            links = f"[comment without GitHub]({own}) · " + links
        if e.get("kind"):
            body = (f"This principle is **open for decision** in [{title}]({url}) (#{e['number']}).\n\n"
                    f"**Status:** {html.escape(e['status'] or '')}\n\n{html.escape(e['summary'] or '')}\n\n")
            panel = ""
            if forms.get("webapp_url"):
                panel = (f'<div class="lof-vote" data-pr="{e["number"]}" '
                         f'data-lof-webapp="{html.escape(forms["webapp_url"])}"></div>\n\n')
            out.append('!!! info "Open for decision"\n' + "\n".join("    " + l if l else "" for l in (body + links).split("\n"))
                       + "\n\n" + panel)
        else:
            body = (f"This principle is part of a **proposal for adoption**, [{title}]({url}) (#{e['number']}), "
                    "which is not yet open for decision. Comments are welcome now, from anyone. When it opens, "
                    "members will be able to approve or object here.\n\n")
            out.append('!!! note "Proposed for adoption"\n' + "\n".join("    " + l if l else "" for l in (body + links).split("\n")) + "\n\n")
    return "".join(out)


def on_page_markdown(markdown, page, config, files):
    m = PAGE.search(page.file.src_uri)
    if not m:
        return markdown
    status, forms = _load()
    entries = status.get(m.group(2))
    if not entries:
        return markdown
    # Insert under the title (and any draft banner that follows it).
    return re.sub(r"(?m)\A(# .*\n)", lambda h: h.group(1) + "\n" + box(entries, forms), markdown, count=1)
