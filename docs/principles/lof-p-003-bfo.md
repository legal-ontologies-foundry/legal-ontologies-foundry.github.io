# LOF-P-003: Common upper ontology

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

The ontology is aligned to Basic Formal Ontology, and every class descends from a BFO class.

## Purpose

A shared upper ontology is what makes independently developed ontologies interoperable. It guarantees that an obligation modeled in one ontology and a role modeled in another stand in well-defined relations to each other and to the physical and documentary entities they depend on.

## Recommendations and requirements

1. The ontology imports BFO 2020 (ISO/IEC 21838-2), or a module extracted from it.
2. Every class in the ontology is a subclass, directly or through its ancestors, of a BFO class.
3. BFO relations are used wherever they carry the intended meaning. Relations from the Relation Ontology (RO) or from other member ontologies are reused before new relations are minted.

## Implementation

The template imports BFO 2020 core through `src/ontology/imports/bfo_import.owl`. Refresh it with `make imports`.

## Examples

A class *legal role* declared as a subclass of BFO *role* (`BFO:0000023`).

## Criteria for review

No class lacks a BFO ancestor. New relations are justified against existing BFO and RO relations.

**Automated check:** SPARQL check `not-bfo-grounded-violation`.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-003-bfo.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
