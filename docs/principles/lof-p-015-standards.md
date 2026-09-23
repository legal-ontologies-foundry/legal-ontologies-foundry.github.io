# LOF-P-015: Alignment with existing legal standards

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

The ontology documents its relationship to established legal information standards.

## Purpose

Legal information already circulates in established formats. Documented mappings let Foundry ontologies annotate that data rather than compete with it.

## Recommendations and requirements

1. Where a relevant standard exists (for example Akoma Ntoso, LegalRuleML, LKIF, ELI, ECLI), the README states whether and how the ontology maps to it.
2. Term-level mappings, where provided, use `skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch`, or `skos:narrowMatch`, or a SSSOM mapping file.
3. Mappings are not asserted as logical equivalences unless the ontological commitments have been checked.

## Implementation

Keep mappings in a separate SSSOM file under `src/mappings/` when they are numerous.

## Examples

A class for judgments mapped to the Akoma Ntoso `judgment` document type with `skos:closeMatch`.

## Criteria for review

Relevant standards are identified, and mappings use the appropriate SKOS strength.

**Automated check:** None. Manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-015-standards.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
