"""Tests for scripts/registry_status.py against a simulated GitHub. Run: python util/tests/test_registry_status.py"""
import base64, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts"))
import registry_status as rs

R = rs.REPO
def entry(status, release=None, review=None, extra=""):
    s = f"""---
id: nao
preferred_prefix: NAO
title: Normative Accountability Ontology (NAO)
description: test entry for the registry status check
domain: accountability
jurisdictions: [general]
status: {status}
activity_status: active
repository: https://github.com/legal-ontologies-foundry/lof-nao
tracker: https://github.com/legal-ontologies-foundry/lof-nao/issues
license: {{label: CC BY 4.0, url: https://creativecommons.org/licenses/by/4.0/}}
contact: {{label: David R. Koepsell, email: d@x, github: dkoepsell}}
"""
    if release: s += f"release: {{version: {release[0]}, tag: {release[1]}}}\n"
    if review: s += f"review: {{date: '2026-11-20', issue: {review}}}\n"
    return s + extra + "---\nBody\n"

class Fake:
    def __init__(s): s.reset()
    def reset(s):
        s.files = {}; s.pr = None; s.prfiles = []; s.comments = []; s.labels = set(); s.issues = []; s.created = []
        s.repo_ok = True; s.tags = {}; s.owl = set(); s.runs = {}; s.search_items = []; s.next = 100
    def __call__(s, method, path, body=None):
        if path.startswith(f"/repos/{R}/contents/"):
            p, ref = path[len(f"/repos/{R}/contents/"):].split("?ref=")
            c = s.files.get((p, ref)); return {"content": base64.b64encode(c.encode()).decode()} if c else None
        if s.pr and path == f"/repos/{R}/pulls/{s.pr['number']}": return s.pr
        if path.startswith(f"/repos/{R}/pulls/") and "/files" in path: return s.prfiles
        if path.startswith(f"/repos/{R}/pulls?state=open"): return [s.pr] if s.pr else []
        if path.startswith(f"/repos/{R}/issues/") and path.endswith("/comments?per_page=100"): return s.comments
        if path.startswith(f"/repos/{R}/issues/") and path.endswith("/comments") and method == "POST":
            s.comments.append({"id": len(s.comments) + 1, "body": body["body"]}); return {}
        if path.startswith(f"/repos/{R}/issues/comments/") and method == "PATCH":
            cid = int(path.split("/")[-1]); s.comments[cid - 1]["body"] = body["body"]; return {}
        if path.endswith("/labels") and method == "GET": return [{"name": l} for l in s.labels]
        if path.endswith("/labels") and method == "POST": s.labels |= set(body["labels"]); return {}
        if "/labels/" in path and method == "DELETE":
            from urllib.parse import unquote; s.labels.discard(unquote(path.split("/labels/")[1])); return {}
        if path == "/repos/legal-ontologies-foundry/lof-nao": return {"private": False} if s.repo_ok else None
        if "/git/ref/tags/" in path:
            t = path.split("/git/ref/tags/")[1]; return {"object": {"type": "commit", "sha": s.tags[t]}} if t in s.tags else None
        if "/lof-nao/contents/lof-nao.owl" in path: return {"name": "x"} if path.split("?ref=")[1] in s.owl else None
        if "/check-runs" in path: return {"check_runs": s.runs.get(path.split("/commits/")[1].split("/")[0], [])}
        if path.startswith("/search/issues"):
            if "in%3Atitle" in path or "in:title" in path: return {"total_count": 0}
            return {"items": s.search_items}
        if path == f"/repos/{R}/issues" and method == "POST":
            s.created.append(body); return {"number": 500 + len(s.created)}
        raise AssertionError(f"unhandled {method} {path}")

F = Fake(); rs.gh = F
rs.members = lambda: [{"name": "David R. Koepsell", "github": "dkoepsell", "committee": True},
                      {"name": "William Mandrick", "github": "williammandrick-cmd", "committee": True},
                      {"name": "Barry Smith", "committee": True}]
FAILED = []
def ok(c, m):
    print(("PASS " if c else "FAIL ") + m)
    if not c:
        FAILED.append(m)
def run_pr(base, head, draft=False):
    F.pr = {"number": 61, "state": "open", "draft": draft, "base": {"sha": "B"}, "head": {"sha": "H"}}
    F.prfiles = [{"filename": "ontology/nao.md", "status": "modified"}]
    F.files[("ontology/nao.md", "B")] = base; F.files[("ontology/nao.md", "H")] = head
    rs.check_pr(61)
    return F.comments[-1]["body"] if F.comments else ""

# 1. draft -> candidate, no release named, no tag: not open, no label
F.reset(); c = run_pr(entry("draft"), entry("candidate"))
ok("❌ | The entry names the release" in c and not F.labels and "Not yet open" in c, "candidate without a release: listed as unmet, no label")
# 2. release named but checks failing on the tag
F.tags = {"v0.2.0": "abc1234"}; F.owl = {"v0.2.0"}; F.runs = {"abc1234": [{"name": "qc", "status": "completed", "conclusion": "failure"}]}
c = run_pr(entry("draft"), entry("candidate", ("0.2.0", "v0.2.0")))
ok("not passing: qc" in c and not F.labels and len(F.comments) == 1, "failing checks block it; the one comment is updated, not duplicated")
# 3. checks fixed: routine label added
F.runs = {"abc1234": [{"name": "qc", "status": "completed", "conclusion": "success"}]}
c = run_pr(entry("draft"), entry("candidate", ("0.2.0", "v0.2.0")))
ok(F.labels == {"decision: routine"} and "All requirements are met" in c, "all met: opened for decision as routine")
# 4. a regression removes the label again
F.owl = set(); c = run_pr(entry("draft"), entry("candidate", ("0.2.0", "v0.2.0")))
ok(not F.labels and "missing at the repository root" in c, "release file missing: label removed")
# 5. drafts are never opened for decision
F.owl = {"v0.2.0"}; c = run_pr(entry("draft"), entry("candidate", ("0.2.0", "v0.2.0")), draft=True)
ok(not F.labels and "mark it ready" in c, "draft pull request: not opened for decision")

# 6. candidate -> accepted
F.reset(); F.tags = {"v0.2.0": "abc1234"}; F.owl = {"v0.2.0"}; F.runs = {"abc1234": [{"name": "qc", "status": "completed", "conclusion": "success"}]}
rev = lambda n, who, rec, ver="0.2.0 (v0.2.0)": {"number": n, "html_url": f"https://gh/issues/{n}", "user": {"login": who},
      "labels": [{"name": "review"}], "body": f"### Ontology ID\n\nnao\n\n### Release reviewed\n\n{ver}\n\n### Recommendation\n\n{rec}\n"}
F.search_items = [rev(70, "williammandrick-cmd", "Accept"), rev(71, "dkoepsell", "Accept after minor revisions")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/70"))
ok("❌ | Two reviews" in c and not F.labels, "only one Accept: not open")
# 7. second reviewer is the maintainer: committee + non-maintainer pair still needed
F.search_items = [rev(70, "williammandrick-cmd", "Accept"), rev(72, "dkoepsell", "Accept")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/70"))
ok(F.labels == {"decision: substantive"}, "committee reviewer (Bill) + other reviewer: Bill is not the maintainer, so the pair qualifies")
# 8. both reviewers are the maintainer's side only: maintainer reviews + an outsider who is not committee
F.search_items = [rev(73, "dkoepsell", "Accept"), rev(74, "outsider", "Accept")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/74"))
ok(F.labels == {"decision: substantive"}, "committee member (maintainer) + outsider non-maintainer: qualifies")
F.search_items = [rev(75, "outsider", "Accept"), rev(76, "other", "Accept")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/75"))
ok(not F.labels and "committee: none" in c, "no committee reviewer: label removed")
# 9. reviews of an older release don't count; review field must point to a review
F.search_items = [rev(70, "williammandrick-cmd", "Accept", "0.1.0"), rev(74, "outsider", "Accept", "0.1.0")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/70"))
ok(not F.labels and "none yet" in c, "reviews of another release do not count")
F.search_items = [rev(70, "williammandrick-cmd", "Accept"), rev(74, "outsider", "Accept")]
c = run_pr(entry("candidate", ("0.2.0", "v0.2.0")), entry("accepted", ("0.2.0", "v0.2.0"), "https://gh/issues/999"))
ok(not F.labels and "❌ | The entry records the review" in c, "review field pointing elsewhere: not open")

# 10. invalid jump
F.reset(); c = run_pr(entry("draft"), entry("accepted", ("0.2.0", "v0.2.0")))
ok("❌ | This status change is one the review procedure allows" in c and not F.labels, "draft → accepted refused")
# 11. no status change: no comment at all
F.reset(); run_pr(entry("draft"), entry("draft", extra="usages: []\n"))
ok(not F.comments, "metadata edit without a status change: left alone")

# 12. push to main: review tracking issue for a new candidate
F.reset()
orig_listdir = os.listdir; os.listdir = lambda p: ["nao.md", "odp-001.md"] if p.endswith("ontology") else orig_listdir(p)
F.files[("ontology/nao.md", "OLD")] = entry("draft"); F.files[("ontology/nao.md", "NEW")] = entry("candidate", ("0.2.0", "v0.2.0"))
F.files[("ontology/odp-001.md", "OLD")] = entry("draft").replace("id: nao", "id: odp-001"); F.files[("ontology/odp-001.md", "NEW")] = F.files[("ontology/odp-001.md", "OLD")]
rs.open_review_tracking("OLD", "NEW")
ok(len(F.created) == 1 and F.created[0]["title"] == "Review of nao 0.2.0" and "@dkoepsell" in F.created[0]["body"]
   and "review tracking" in F.created[0]["labels"], "new candidate: one review tracking issue opened, committee asked to assign")
os.listdir = orig_listdir
sys.exit(1 if FAILED else 0)
