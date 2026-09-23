# LOF-P-004: Explicit grounding of legal entities

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Each top-level legal class states which BFO category it falls under, and why.

## Purpose

Legal entities such as obligations, rights, powers, legal persons, institutions, legal acts, and legal documents do not fit naive physical categories, and reasonable ontologists disagree about their placement. The Foundry does not settle every such dispute by fiat. It requires that each ontology make its choice explicit and defend it, so that alignment across ontologies is possible and disagreements are visible rather than hidden.

## Recommendations and requirements

1. Each top-level legal class (a class whose parent is a BFO class) has an `rdfs:comment` or linked documentation stating the rationale for its BFO placement.
2. Where a Foundry design pattern (LOF-ODP) covers the modeling problem, the ontology uses it or documents why it departs from it.
3. Placements that conflict with an accepted member ontology are raised with the Editorial Working Group before release.

## Implementation

Record the rationale in the class annotation, and summarize the grounding decisions in a section of the ontology's README.

## Examples

*Legal obligation* placed under *generically dependent continuant* on the ground that the same obligation can be concretized in many documents and survives the loss of any one of them; or under *specifically dependent continuant*, with a stated rationale. Either is acceptable if argued.

## Criteria for review

The reviewer can identify, for every top-level legal class, its BFO placement and the reason for it, and checks it against the LOF design patterns.

**Automated check:** None. Manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-004-grounding.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
