# Automated checks

Checks that can be automated run in each ontology's CI through the template
`Makefile` (`make test`), or in the website's CI through registry validation.
Checks that cannot be automated are covered by the [review SOP](../sop/review.md).

## Ontology checks

| Check | Tool | Principle | Fails the build |
|---|---|---|---|
| Parses and merges with imports | ROBOT `merge` | LOF-P-002 | yes |
| Consistent, no unsatisfiable classes | ROBOT `reason` (HermiT) | LOF-P-011 | yes |
| Every class has a BFO ancestor | `not-bfo-grounded-violation.sparql` | LOF-P-003 | yes |
| Term IRIs well-formed | `malformed-iri-violation.sparql` | LOF-P-005 | yes |
| Deprecated terms have a replacement | `deprecated-without-replacement-violation.sparql` | LOF-P-005 | yes |
| Every term has a definition | `missing-definition-violation.sparql` | LOF-P-007 | yes |
| Every term has a label | `missing-label-violation.sparql` | LOF-P-012 | yes |
| At most one label per language | `multiple-labels-violation.sparql` | LOF-P-012 | yes |
| Labels begin in lower case | `label-uppercase-warning.sparql` | LOF-P-012 | no (report only) |
| OBO-style quality report | ROBOT `report` | LOF-P-001, 008, 012 | on ERROR only |

## Registry checks

| Check | Principle |
|---|---|
| Metadata validates against the schema | LOF-P-001, 013, 016, 017 |
| `id` matches file name; ids and prefixes unique | LOF-P-005 |
| Dependencies refer to known ontologies | LOF-P-009 |

## Planned

A Foundry dashboard, modeled on the OBO Dashboard, that runs these checks
across every registered ontology and publishes the results.
