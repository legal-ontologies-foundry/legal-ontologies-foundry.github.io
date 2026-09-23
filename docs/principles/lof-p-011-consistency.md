# LOF-P-011: Logical well-formedness

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Each release is logically consistent and contains no unsatisfiable classes.

## Purpose

An inconsistent ontology entails everything, and an unsatisfiable class can have no instances. Either defect makes automated reasoning over legal data worthless.

## Recommendations and requirements

1. The ontology, merged with its imports, is consistent under an OWL 2 DL reasoner (HermiT, or ELK for large EL ontologies).
2. No named class is unsatisfiable.
3. The check passes before every release.

## Implementation

`make test` runs the HermiT check through ROBOT. CI runs it on every push and pull request.

## Examples

See the LOF ontology template.

## Criteria for review

CI is green on the release commit.

**Automated check:** `robot reason` in CI.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-011-consistency.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
