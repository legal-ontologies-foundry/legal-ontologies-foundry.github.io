# LOF-P-017: Locus of authority

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Each ontology has a single named point of contact responsible for it.

## Purpose

Users and the Foundry need to know who can answer questions and make decisions about an ontology.

## Recommendations and requirements

1. The registry entry names one contact person with a working email address and GitHub handle.
2. The contact person is a maintainer of the ontology, or can reach one promptly.

## Implementation

Set the `contact` field in the registry metadata. Update it when responsibility changes.

## Examples

See the LOF ontology template.

## Criteria for review

The contact is reachable.

**Automated check:** Registry schema validation of `contact`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-017-authority.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
