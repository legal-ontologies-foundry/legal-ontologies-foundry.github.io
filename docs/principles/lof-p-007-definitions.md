# LOF-P-007: Textual definitions

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Every class and relation has a precise, non-circular textual definition.

## Purpose

In law, the meaning of a term is often the point in dispute. Definitions make the intended meaning checkable by lawyers and domain experts who will never read an axiom.

## Recommendations and requirements

1. Every class and relation in the ontology's namespace has exactly one English definition, recorded with `skos:definition` or `IAO:0000115`.
2. Class definitions take genus and differentia form where possible: "An *X* is a *Y* that *Z*", where *Y* is the asserted parent.
3. Definitions do not use the term being defined, and cite a source (statute, case, treatise) with `dcterms:source` where one exists.

## Implementation

Add the definition when the term is created. Protégé's annotation panel supports both properties.

## Examples

*legal role*: "A role that inheres in a person or organization in virtue of recognition by a legal institution and that is realized in legally significant processes." (Illustrative only.)

## Criteria for review

Definitions are present, match the asserted parent, and are intelligible to a legal expert.

**Automated check:** SPARQL check `missing-definition-violation`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-007-definitions.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
