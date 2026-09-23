# SOP: Ontology review

Review moves an ontology from *candidate* to *accepted*.

1. **Submit.** The contact person opens a pull request changing the
   ontology's `status` to `candidate`, linking a tagged release.
2. **Assign reviewers.** The Editorial Working Group assigns two reviewers:
   one Operations Committee member and one reviewer who is not a maintainer
   of the ontology.
3. **Review.** Each reviewer opens an **Ontology review** issue using the
   form, which lists every principle as a checkbox, and records findings for
   each unmet principle. Automated check results are taken from the
   ontology's CI.
4. **Revise.** Maintainers address findings and tag a new release. Reviewers
   update their issues.
5. **Decide.** When both reviewers recommend acceptance, the change to
   `status: accepted` is approved as a substantive change (see
   [Governance](../about/governance.md)), and the `review` field records the
   date and issue.

## Re-review

Accepted ontologies are re-reviewed if a principle is amended in a way that
affects them, or if an overlap dispute is raised.
