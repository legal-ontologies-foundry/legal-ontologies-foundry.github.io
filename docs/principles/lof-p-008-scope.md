# LOF-P-008: Clearly delineated scope

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

The ontology has a stated scope and a set of competency questions.

## Purpose

Scope statements prevent overlap between member ontologies and let users decide quickly whether an ontology fits their needs. Competency questions make scope testable.

## Recommendations and requirements

1. The ontology header has a `dcterms:description`, and the README contains a scope statement saying what the ontology covers and excludes.
2. The README lists competency questions: questions a knowledge base using the ontology should be able to answer.
3. The registry entry's `domain` field agrees with the scope statement.

## Implementation

Write the scope statement and competency questions before modeling begins. They are required in the new ontology request.

## Examples

"Covers the conferral, holding, and revocation of legal roles by institutions. Excludes the content of the obligations attached to those roles."

## Criteria for review

Scope and competency questions exist and are specific enough to judge overlap with other member ontologies.

**Automated check:** ROBOT report check `missing_ontology_description`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-008-scope.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
