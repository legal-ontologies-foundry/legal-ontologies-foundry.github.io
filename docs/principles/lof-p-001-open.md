# LOF-P-001: Open

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

The ontology is released under the Creative Commons Attribution 4.0 license (CC BY 4.0), so that anyone may use it without constraint other than attribution.

## Purpose

Legal ontologies are infrastructure for courts, agencies, researchers, and developers across jurisdictions. Restrictive licenses fragment that infrastructure and prevent the integration the Foundry exists to support.

## Recommendations and requirements

1. Every Foundry ontology is released under **CC BY 4.0** (`https://creativecommons.org/licenses/by/4.0/`), the current version of the Creative Commons Attribution license. Attribution is what makes contributions creditable and citable (LOF-P-018).
2. The license is declared in the ontology header with `dcterms:license` whose value is the license IRI.
3. The same license is recorded in the ontology's registry metadata.

## Implementation

Add `Annotation(dcterms:license <https://creativecommons.org/licenses/by/4.0/>)` to the ontology header. The ontology template does this by default.

## Examples

The header of every file generated from the LOF ontology template declares CC BY 4.0.

## Criteria for review

The ontology header and the registry entry both declare CC BY 4.0. Content derived from sources with incompatible licenses (for example, proprietary legal databases) is not included.

**Automated check:** ROBOT report check `missing_ontology_license`; registry schema validation of `license`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-001-open.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
