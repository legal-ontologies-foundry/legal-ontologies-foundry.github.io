# LOF-P-018: Attribution

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Contributors to the ontology are credited, and the ontology, each of its releases, and the contributions to it can be cited.

## Purpose

Ontology development is scholarly work. Credit sustains contributions, and citability lets that work count in the academic and professional record.

## Recommendations and requirements

1. The ontology header lists creators with `dcterms:creator` and contributors with `dcterms:contributor`, using ORCID IRIs where available.
2. Term-level contributions may be recorded with `dcterms:contributor` on the term.
3. The README gives a preferred citation of the ontology, naming its creators, title, version, and version IRI (LOF-P-006), so that each **release** can be cited exactly. A DOI for each release (for example, through Zenodo) is recommended.
4. **Contributions** are citable through the release that contains them: a term's `dcterms:contributor` records who contributed it, and the term's IRI and the release's version IRI identify it, so a contribution can be cited as "term, contributor, ontology, version". The repository history records the same contributions in detail.

## Implementation

Add ORCID IRIs to the header when onboarding each new contributor.

## Examples

`Annotation(dcterms:creator <https://orcid.org/0000-0000-0000-0000>)`

## Criteria for review

Creators are listed, contributors are credited where they contributed terms, and a citation of the current release is given.

**Automated check:** None. Manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-018-attribution.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
