# LOF-P-012: Naming conventions

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Labels are unique, singular, and follow a consistent lexical style.

## Purpose

Consistent labels make ontologies readable together and reduce errors when terms are chosen from pick lists.

## Recommendations and requirements

1. Every entity has exactly one `rdfs:label` per language.
2. Labels are singular nouns or noun phrases, in lower case except for proper nouns and established acronyms.
3. Labels are unique within the ontology, and preferably within the Foundry.

## Implementation

Use `skos:altLabel` for synonyms and jurisdiction-specific alternative names rather than adding a second label.

## Examples

"legal obligation", not "Legal Obligations"; "European Court of Human Rights" keeps its capitals.

## Criteria for review

Label style is consistent, and warnings from the label-case check are justified.

**Automated check:** SPARQL checks `missing-label-violation`, `multiple-labels-violation`, and the `label-uppercase-warning` report; ROBOT report check `duplicate_label`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-012-naming.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
