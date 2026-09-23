# LOF-P-009: Orthogonality

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Member ontologies do not duplicate one another's content.

## Purpose

Two classes for the same legal entity, minted in two ontologies, force every user to reconcile them. Orthogonality means each kind of entity is defined once, by the group best placed to maintain it.

## Recommendations and requirements

1. Before minting a term, developers check the registry for an existing member-ontology term with the same meaning.
2. Where one exists, it is imported or referenced by IRI rather than redefined.
3. Overlaps found in review are resolved by the maintainers concerned, with the Editorial Working Group mediating.

## Implementation

Import the relevant module from the other member ontology through the catalog, as the template does for BFO.

## Examples

An ontology of court procedure reuses *legal role* from a roles ontology rather than defining its own *judge role* parent class.

## Criteria for review

The reviewer searches accepted ontologies for labels and definitions overlapping the candidate's terms.

**Automated check:** None yet. A cross-registry label overlap report is planned.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-009-orthogonality.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
