# LOF-P-005: Persistent identifiers

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Every entity has a persistent IRI in the `https://w3id.org/lof/` namespace, and IRIs are never reassigned or deleted.

## Purpose

Legal data annotated with an ontology term must mean the same thing years later. Identifiers that move, change meaning, or disappear silently corrupt every dataset that uses them.

## Recommendations and requirements

1. Term IRIs follow the pattern `https://w3id.org/lof/{PREFIX}_{7 digits}`, using the prefix reserved in the registry.
2. Local identifiers are opaque and never encode the label.
3. A term whose meaning changes gets a new IRI, and the old term is deprecated following the [deprecation policy](../policy/deprecation.md).
4. Terms are never deleted from the ontology.

## Implementation

Configure Protégé to generate IRIs from the editor's allocated ID range (see [ID ranges](../policy/id-ranges.md)).

## Examples

`https://w3id.org/lof/ODP001_0001000`

## Criteria for review

All IRIs in the ontology's namespace are well-formed. No term present in the previous release is missing from the current one.

**Automated check:** SPARQL checks `malformed-iri-violation` and `deprecated-without-replacement-violation`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-005-identifiers.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
