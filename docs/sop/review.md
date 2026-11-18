# SOP: Ontology review

Every registered ontology has a `status` (see the [metadata policy](../policy/metadata.md)): it is
registered as **draft**, becomes a **candidate** when submitted for review, and is **accepted** when
reviewed and found to satisfy the [principles](../principles/index.md). This page sets out each step:
what is required, and who decides.

Each step is a pull request changing the ontology's entry in `ontology/{id}.md`. The Foundry's
**registry status check** reads the pull request, checks the requirements below, and reports them in a
comment on it. When every requirement is met it adds the decision label, which opens the vote under
[Governance](../about/governance.md); if a requirement stops being met, it removes the label again.

## Draft to candidate

The maintainers submit the ontology for review.

**Requirements**

1. The entry names the release submitted, as `release: {version: x.y.z, tag: vx.y.z}`.
2. The ontology's repository exists and is public.
3. The tag exists in the repository, made following the [release procedure](release.md).
4. The release file `lof-{id}.owl` is in the tagged release.
5. The ontology's automated checks ran on the tagged commit and pass (LOF-P-011).

**Decision.** A **routine** change: adopted once one Operations Committee member approves and no voting
member objects. The check adds `decision: routine` when the requirements are met.

**What follows.** When the change is merged, a **review tracking issue** is opened automatically, asking
for two reviewers to be assigned and linking the review form.

## Review

1. **Assign reviewers.** The Editorial Working Group lead assigns two reviewers, or, while that post is
   vacant, the Operations Committee does. One reviewer is an Operations Committee member; the other is
   not a maintainer of the ontology.
2. **Review.** Each reviewer files an **Ontology review** issue using the form, which lists every
   principle as a checkbox, naming the release reviewed and recording findings for each unmet principle.
   Reviews are due within 30 days of assignment. Automated check results are taken from the ontology's
   checks on the tagged release.
3. **Revise.** The maintainers address findings and tag a new release, updating `release` in the entry.
   Reviewers update their issues for the new release. Reviews of an earlier release do not count.

## Candidate to accepted

**Requirements**

1. Requirements 1 to 5 above, for the release reviewed.
2. Two review issues of that release recommend **Accept** (not "Accept after minor revisions"), filed by
   two different reviewers: one an Operations Committee member, the other not a maintainer of the
   ontology.
3. The entry records the review, as `review: {date: YYYY-MM-DD, issue: <URL of one of the reviews>}`.

**Decision.** A **substantive** change: a comment period of at least 14 days, and approval by every
Operations Committee member and a majority of the voting members who vote. The check adds
`decision: substantive` when the requirements are met.

## Deprecation

Any ontology may be marked **deprecated** when it is superseded or no longer maintained, naming its
successor in `replaced_by` if it has one. Its identifiers remain resolvable. This is a **substantive**
change.

## Other changes

No other status change is allowed. In particular an ontology cannot go from draft to accepted without
being a candidate first, and the check reports such a pull request as not allowed. Changes to an
entry's other metadata that do not change its status are routine changes, as before.

## Re-review

Accepted ontologies are re-reviewed if a principle is amended in a way that affects them, or if an
overlap dispute is raised.
