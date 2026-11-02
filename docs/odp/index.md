# Design Patterns

Ontology design patterns (ODPs) are small, reusable modeling solutions to
recurring problems in representing legal reality. Member ontologies are
expected to use Foundry patterns where they apply, or to document why they
depart from them (see principle
[LOF-P-004](../principles/lof-p-004-grounding.md)).

The patterns build on one another:

| Pattern | Title | Depends on | Status |
|---|---|---|---|
| [LOF-ODP-001](odp-001.md) | Legal Act and Legal Document | BFO | draft |
| [LOF-ODP-002](odp-002.md) | Legal Role Conferral | ODP-001 | draft |
| [LOF-ODP-003](odp-003.md) | Correlative Deontic Positions | ODP-001 | draft, placement decision open |
| [LOF-ODP-004](odp-004.md) | Minimum Legal Chain | ODP-001, 002, 003 | draft, placement-neutral |
| [LOF-ODP-005](odp-005.md) | Legal Time and Versions | ODP-001, 003, 004 | draft, placement-neutral |
| [LOF-ODP-006](odp-006.md) | Relations between Norms | ODP-001, 003 | draft, placement-neutral |

A worked example, a residential lease, runs through the first four. ODP-005 and 006 are worked on the General Data Protection Regulation and the legislation around it.

New patterns follow the [pattern template](template.md).
