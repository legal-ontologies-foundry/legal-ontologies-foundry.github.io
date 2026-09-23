# LOF-P-002: Common format

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

The ontology is released in OWL 2, with a stable primary release file.

## Purpose

A common format lets member ontologies import one another and lets the same tools (Protégé, ROBOT, reasoners, triple stores) operate on all of them.

## Recommendations and requirements

1. A release file `lof-{id}.owl` is published at the root of the ontology repository, serialized as RDF/XML or Turtle.
2. A base file `lof-{id}-base.owl`, containing only the ontology's own axioms, is also published.
3. Other serializations may be offered, but the OWL release is authoritative.

## Implementation

Run `make release VERSION=x.y.z` in `src/ontology/`. The template Makefile produces both files with ROBOT.

## Examples

`https://w3id.org/lof/odp-001.owl` (full) and `https://w3id.org/lof/odp-001/odp-001-base.owl` (base).

## Criteria for review

Both release files exist, parse without error, and resolve through their persistent IRIs.

**Automated check:** CI parse and merge with ROBOT on every push.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-002-format.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
