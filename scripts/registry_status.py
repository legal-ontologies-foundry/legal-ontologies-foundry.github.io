#!/usr/bin/env python3
"""Check registry status changes against the review procedure, and open them for decision.

Run by .github/workflows/registry-status.yml. Three entry points, chosen from the GitHub event:

pull_request_target   A pull request changes `status` in ontology/{id}.md. The requirements for that
                      step (docs/sop/review.md) are checked and reported in one comment on the pull
                      request. When all are met, the decision label is added (routine for draft to
                      candidate, substantive for candidate to accepted), which opens the vote; when they
                      stop being met, the label is removed.
issues                A review issue is filed, edited, or closed: pull requests proposing acceptance of
                      that ontology are checked again.
push (main)           An ontology has just become a candidate: a review tracking issue is opened.

Pull request code is never run: files are read from the pull request through the API.
"""
from datetime import date
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

import yaml

REPO = os.environ.get("GITHUB_REPOSITORY", "legal-ontologies-foundry/legal-ontologies-foundry.github.io")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
API = "https://api.github.com"
MARK = "<!-- registry-status -->"
LABELS = {"routine": "decision: routine", "substantive": "decision: substantive"}
OK_CONCLUSIONS = {"success", "neutral", "skipped"}


# ---------------------------------------------------------------- GitHub

def gh(method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Accept": "application/vnd.github+json", "User-Agent": "lof-registry-status",
                                          **({"Authorization": f"Bearer {TOKEN}"} if TOKEN else {})})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            text = r.read().decode()
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def file_at(path, ref):
    f = gh("GET", f"/repos/{REPO}/contents/{urllib.parse.quote(path)}?ref={urllib.parse.quote(ref)}")
    return base64.b64decode(f["content"]).decode() if f and "content" in f else None


def front_matter(text):
    if not text:
        return None
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
    return yaml.safe_load(m.group(1)) if m else None


def members():
    try:
        return yaml.safe_load(open(os.path.join(os.path.dirname(__file__), "..", "community", "members.yml"))) or []
    except FileNotFoundError:
        return []


# ---------------------------------------------------------------- the requirements

def check_release(meta):
    """Requirements shared by candidate and accepted: a tagged release whose checks pass."""
    results = []
    repo_url = meta.get("repository", "")
    m = re.match(r"https://github\.com/([^/]+)/([^/]+?)/?$", repo_url)
    owner_repo = f"{m.group(1)}/{m.group(2)}" if m else None
    repo = gh("GET", f"/repos/{owner_repo}") if owner_repo else None
    results.append(("The ontology's repository exists and is public",
                    bool(repo) and not repo.get("private"), repo_url or "no `repository` field"))
    rel = meta.get("release") or {}
    tag, version = rel.get("tag"), rel.get("version")
    results.append(("The entry names the release: `release: {version, tag}`", bool(tag and version),
                    f"{version} ({tag})" if tag else "add `release:` with `version` and `tag`"))
    if not (repo and tag):
        return results, None
    ref = gh("GET", f"/repos/{owner_repo}/git/ref/tags/{urllib.parse.quote(tag)}")
    sha = None
    if ref:
        sha = ref["object"]["sha"]
        if ref["object"]["type"] == "tag":                       # annotated tag: follow it to the commit
            sha = gh("GET", f"/repos/{owner_repo}/git/tags/{sha}")["object"]["sha"]
    results.append((f"Tag `{tag}` exists in the repository", bool(sha), sha[:7] if sha else "not found"))
    if not sha:
        return results, None
    owl = gh("GET", f"/repos/{owner_repo}/contents/lof-{meta['id']}.owl?ref={urllib.parse.quote(tag)}")
    results.append((f"The release file `lof-{meta['id']}.owl` is in the tagged release (release SOP)", bool(owl),
                    "present" if owl else "missing at the repository root"))
    runs = (gh("GET", f"/repos/{owner_repo}/commits/{sha}/check-runs?per_page=100") or {}).get("check_runs", [])
    bad = [r["name"] for r in runs if r["status"] != "completed" or r["conclusion"] not in OK_CONCLUSIONS]
    detail = (f"{len(runs)} check{'s' if len(runs) != 1 else ''}, all passing" if runs and not bad
              else "no automated checks ran on the tagged commit" if not runs
              else "not passing: " + ", ".join(bad))
    results.append(("Automated checks pass on the tagged release (LOF-P-011)", bool(runs) and not bad, detail))
    return results, owner_repo


def field(body, label):
    """A field from an issue form, which GitHub renders as '### Label' followed by the answer."""
    m = re.search(r"###\s*" + re.escape(label) + r"\s*\n+(.*?)(?:\n###|\Z)", body or "", re.S)
    return m.group(1).strip() if m else ""


def reviews_for(oid):
    q = urllib.parse.quote(f'repo:{REPO} is:issue label:review "{oid}" in:body')
    found = (gh("GET", f"/search/issues?q={q}&per_page=50") or {}).get("items", [])
    return [i for i in found if field(i.get("body"), "Ontology ID").lower() == oid.lower()]


def check_reviews(meta, mem):
    """Requirements for acceptance: two recommending reviews, with the reviewers the procedure asks for."""
    oid, version = meta["id"], str((meta.get("release") or {}).get("version", ""))
    committee = {str(m["github"]).lower() for m in mem if m.get("committee") and m.get("github")}
    maintainer = str((meta.get("contact") or {}).get("github", "")).lower()
    revs = [r for r in reviews_for(oid) if version and version in field(r.get("body"), "Release reviewed")]
    accept = [r for r in revs if field(r.get("body"), "Recommendation").strip() == "Accept"]
    authors = {r["user"]["login"].lower(): r for r in accept}
    results = [
        (f"Two reviews of release {version or '(none named)'} recommend **Accept**", len(authors) >= 2,
         ", ".join(f"#{r['number']} by @{a}" for a, r in authors.items()) or "none yet"),
        ("One reviewer is an Operations Committee member, and the other is not a maintainer of the ontology",
         any(a in committee and b != maintainer for a in authors for b in authors if a != b),
         "committee: " + (", ".join(f"@{a}" for a in authors if a in committee) or "none")
         + f"; maintainer: @{maintainer or '?'}"),
    ]
    rv = meta.get("review") or {}
    urls = {r["html_url"] for r in accept}
    results.append(("The entry records the review: `review: {date, issue}`",
                    bool(rv.get("date")) and rv.get("issue") in urls,
                    f"{rv.get('date')}, {rv.get('issue')}" if rv else "add `review:` with the date and one review issue"))
    return results


def evaluate(base, head):
    """Return (transition, kind, results) for one registry file, or None if no status change."""
    old = (base or {}).get("status")
    new = (head or {}).get("status")
    if not head or old == new or base is None:
        return None
    step = f"{old} → {new}"
    if (old, new) == ("draft", "candidate"):
        res, _ = check_release(head)
        return step, "routine", res
    if (old, new) == ("candidate", "accepted"):
        res, _ = check_release(head)
        return step, "substantive", res + check_reviews(head, members())
    if new == "deprecated":
        res = [("The successor, if any, is named in `replaced_by` (identifiers stay resolvable either way)", True,
                head.get("replaced_by") or "no successor named; give the reason in the pull request")]
        return step, "substantive", res
    return step, None, [("This status change is one the review procedure allows", False,
                         "allowed: draft → candidate, candidate → accepted, any → deprecated")]


# ---------------------------------------------------------------- reporting

def report(pr, evaluations):
    s = (f"{MARK}\n### Registry status check\n\nChecked automatically against the "
         "[review procedure](https://legal-ontologies-foundry.github.io/sop/review/). "
         "This comment updates itself.\n\n")
    ready_all, kinds = True, set()
    for path, (step, kind, results) in evaluations.items():
        oid = path.split("/")[-1][:-3]
        ready = kind is not None and all(ok for _, ok, _ in results)
        ready_all &= ready
        if kind:
            kinds.add(kind)
        s += f"**{oid}: {step}**" + (f" (a {kind} change)" if kind else "") + "\n\n| | Requirement | Found |\n|---|---|---|\n"
        for label, ok, detail in results:
            s += f"| {'✅' if ok else '❌'} | {label} | {detail} |\n"
        s += "\n"
    kind = "substantive" if "substantive" in kinds else ("routine" if kinds else None)
    if ready_all and kind:
        s += (f"**All requirements are met.** This pull request is open for decision as a **{kind}** change "
              f"(`{LABELS[kind]}`); voting members have been sent ballots.\n")
    else:
        s += ("**Not yet open for decision.** When every requirement above is met, the decision label is added "
              "automatically and voting begins.\n")
    return s, (kind if ready_all else None)


def sync(pr_number, s, kind):
    comments = gh("GET", f"/repos/{REPO}/issues/{pr_number}/comments?per_page=100") or []
    mine = [c for c in comments if MARK in (c.get("body") or "")]
    if mine:
        if mine[0]["body"] != s:
            gh("PATCH", f"/repos/{REPO}/issues/comments/{mine[0]['id']}", {"body": s})
    else:
        gh("POST", f"/repos/{REPO}/issues/{pr_number}/comments", {"body": s})
    have = {l["name"] for l in (gh("GET", f"/repos/{REPO}/issues/{pr_number}/labels") or [])}
    want = {LABELS[kind]} if kind else set()
    for lab in (have & set(LABELS.values())) - want:
        gh("DELETE", f"/repos/{REPO}/issues/{pr_number}/labels/{urllib.parse.quote(lab)}")
    if want - have:
        gh("POST", f"/repos/{REPO}/issues/{pr_number}/labels", {"labels": sorted(want - have)})


def check_pr(pr_number):
    pr = gh("GET", f"/repos/{REPO}/pulls/{pr_number}")
    if not pr or pr["state"] != "open":
        return
    files = [f for f in gh("GET", f"/repos/{REPO}/pulls/{pr_number}/files?per_page=100") or []
             if re.fullmatch(r"ontology/[a-z0-9-]+\.md", f["filename"])]
    evaluations = {}
    for f in files:
        base = front_matter(file_at(f["filename"], pr["base"]["sha"])) if f["status"] != "added" else None
        head = front_matter(file_at(f["filename"], pr["head"]["sha"])) if f["status"] != "removed" else None
        e = evaluate(base, head)
        if e:
            evaluations[f["filename"]] = e
    if not evaluations:
        return
    s, kind = report(pr, evaluations)
    if pr.get("draft"):
        kind = None
        s += "\n*This pull request is a draft: mark it ready for review to open it for decision.*\n"
    sync(pr_number, s, kind)
    print(f"#{pr_number}: {'open for ' + kind + ' decision' if kind else 'requirements not yet met'}")


def recheck_for_issue(issue):
    if "review" not in {l["name"] for l in issue.get("labels", [])}:
        return
    oid = field(issue.get("body"), "Ontology ID")
    for pr in gh("GET", f"/repos/{REPO}/pulls?state=open&per_page=100") or []:
        names = [f["filename"] for f in gh("GET", f"/repos/{REPO}/pulls/{pr['number']}/files?per_page=100") or []]
        if f"ontology/{oid}.md" in names:
            check_pr(pr["number"])


def open_review_tracking(before, after):
    """After a push to main, open a review tracking issue for each ontology that just became a candidate."""
    mem = members()
    committee = [f"@{m['github']}" for m in mem if m.get("committee") and m.get("github")]
    for path in sorted(os.listdir(os.path.join(os.path.dirname(__file__), "..", "ontology"))):
        if not path.endswith(".md"):
            continue
        p = f"ontology/{path}"
        new = front_matter(file_at(p, after))
        old = front_matter(file_at(p, before)) if before and not re.fullmatch("0+", before) else None
        if not new or new.get("status") != "candidate" or (old or {}).get("status") == "candidate":
            continue
        rel = new.get("release") or {}
        title = f"Review of {new['id']} {rel.get('version', '')}".strip()
        q = urllib.parse.quote(f'repo:{REPO} is:issue in:title "{title}"')
        if (gh("GET", f"/search/issues?q={q}") or {}).get("total_count"):
            continue
        form = (f"https://github.com/{REPO}/issues/new?template=ontology-review.yml"
                f"&title={urllib.parse.quote('[Review]: ' + new['id'] + ' ' + str(rel.get('version', '')))}")
        body = (f"**{new['title']}** is now a **candidate** for acceptance, at release {rel.get('version')} "
                f"(`{rel.get('tag')}`) of {new.get('repository')}.\n\n"
                "Following the [review procedure](https://legal-ontologies-foundry.github.io/sop/review/):\n\n"
                "- [ ] **Assign two reviewers** (the Editorial Working Group lead, or while that post is vacant the "
                "Operations Committee): one Operations Committee member, and one reviewer who is not a maintainer of "
                f"the ontology. Assigning: {' '.join(committee)}\n"
                f"- [ ] **Reviewer 1** files an [Ontology review]({form}) for release {rel.get('version')}\n"
                f"- [ ] **Reviewer 2** files an [Ontology review]({form}) for release {rel.get('version')}\n"
                "- [ ] Maintainers address findings and tag a new release, if needed\n"
                "- [ ] When both reviews recommend **Accept**, the maintainer opens a pull request setting "
                "`status: accepted` and `review: {date, issue}`; it is checked and opened for decision automatically\n\n"
                f"Reviews are due within 30 days, by {date.fromordinal(date.today().toordinal() + 30).isoformat()}.")
        made = gh("POST", f"/repos/{REPO}/issues", {"title": title, "body": body, "labels": ["review tracking"]})
        print(f"opened review tracking issue #{made['number']} for {new['id']}")


def main():
    event = json.load(open(os.environ["GITHUB_EVENT_PATH"]))
    name = os.environ.get("GITHUB_EVENT_NAME")
    if name in ("pull_request_target", "pull_request"):
        check_pr(event["pull_request"]["number"])
    elif name == "issues":
        recheck_for_issue(event["issue"])
    elif name == "push":
        open_review_tracking(event.get("before"), event.get("after"))
    elif name == "workflow_dispatch":
        for pr in gh("GET", f"/repos/{REPO}/pulls?state=open&per_page=100") or []:
            check_pr(pr["number"])


if __name__ == "__main__":
    main()
