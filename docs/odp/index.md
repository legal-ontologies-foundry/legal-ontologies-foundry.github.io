# Design Patterns

Ontology design patterns (ODPs) are small, reusable modeling solutions to
recurring problems in representing legal reality. Member ontologies are
expected to use Foundry patterns where they apply, or to document why they
depart from them (see principle
[LOF-P-004](../principles/lof-p-004-grounding.md)).

The first four patterns build on one another:

| Pattern | Title | Depends on | Status |
|---|---|---|---|
| [LOF-ODP-001](odp-001.md) | Legal Act and Legal Document | BFO | draft 0.2.0 |
| [LOF-ODP-002](odp-002.md) | Legal Role Conferral | ODP-001 | draft 0.2.0 |
| [LOF-ODP-003](odp-003.md) | Correlative Deontic Positions | ODP-001 | draft 0.2.0 |
| [LOF-ODP-004](odp-004.md) | Minimum Legal Chain | ODP-001, 002, 003 | draft 0.2.0 |

A worked example, a residential lease, runs through all four.

The patterns are aligned with the Document Act Ontology and the Common Core
Ontologies through [two bridge modules](alignment.md). See
[what changed in 0.2.0](changes-0.2.0.md).

New patterns follow the [pattern template](template.md).
