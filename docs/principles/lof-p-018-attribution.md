# LOF-P-018: Attribution

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Contributors to the ontology are credited, and it can be cited.

## Purpose

Ontology development is scholarly work. Credit sustains contributions, and citability lets that work count in the academic and professional record.

## Recommendations and requirements

1. The ontology header lists creators with `dcterms:creator` and contributors with `dcterms:contributor`, using ORCID IRIs where available.
2. Term-level contributions may be recorded with `dcterms:contributor` on the term.
3. The README gives a preferred citation.

## Implementation

Add ORCID IRIs to the header when onboarding each new contributor.

## Examples

`Annotation(dcterms:creator <https://orcid.org/0000-0000-0000-0000>)`

## Criteria for review

Creators are listed, and a citation is given.

**Automated check:** None. Manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-018-attribution.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
