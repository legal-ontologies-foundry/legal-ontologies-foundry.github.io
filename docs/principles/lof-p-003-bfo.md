# LOF-P-003: Common upper ontology

!!! success "Adopted"
    Adopted by the members after public comment, as part of the founding set of
    [LOF principles](index.md). The decision is recorded in the [decision log](../activity/decisions.md).

## Summary

The ontology is aligned to Basic Formal Ontology, and every class descends from a BFO class, by assertion or by inference.

## Purpose

A shared upper ontology is what makes independently developed ontologies interoperable. It guarantees that an obligation modeled in one ontology and a role modeled in another stand in well-defined relations to each other and to the physical and documentary entities they depend on.

## Recommendations and requirements

1. The ontology imports BFO 2020 (ISO/IEC 21838-2), or a module extracted from it.
2. Every class in the ontology is a subclass, directly or through its ancestors, of a BFO class. For a **defined class** (one given by an equivalence axiom, such as *conferred legal role* in LOF-ODP-002), the BFO ancestor may be inferred rather than asserted: its definition must have a genus, a named class that itself descends from BFO, so that a reasoner places the defined class under BFO. A defined class with no such genus (for example, a union of classes from different BFO categories) is not allowed.
3. BFO relations are used wherever they carry the intended meaning. Relations from the Relation Ontology (RO) or from other member ontologies are reused before new relations are minted.

## Implementation

The template imports BFO 2020 core through `src/ontology/imports/bfo_import.owl`. Refresh it with `make imports`.

## Examples

A class *legal role* declared as a subclass of BFO *role* (`BFO:0000023`).

## Criteria for review

No class lacks a BFO ancestor in the **reasoned** ontology. New relations are justified against existing BFO and RO relations.

**Automated check:** SPARQL check `not-bfo-grounded-violation`, run on the ontology after reasoning, so that defined classes are checked against their inferred ancestors.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-003-bfo.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
