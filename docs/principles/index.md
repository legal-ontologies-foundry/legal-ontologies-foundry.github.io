# Principles

!!! warning "Draft for ratification"
    These principles are a founding draft, modeled on the
    [OBO Foundry principles](https://obofoundry.org/principles/fp-000-summary.html)
    and adapted to the legal domain. They take effect when ratified by the
    founding coordinators under the rules in [Governance](../about/governance.md).

Every member ontology commits to the following principles. Each has its own
page setting out its purpose, requirements, implementation, and the criteria
reviewers apply. Principle numbers are permanent and never reused, so reviews
and discussions can cite them precisely (for example, "fails LOF-P-007").

Principles LOF-P-004 (explicit grounding of legal entities) and LOF-P-010
(jurisdictional transparency) have no direct OBO counterpart. They address
problems specific to law.

| ID | Principle | Summary |
|---|---|---|
| [LOF-P-001](lof-p-001-open.md) | Open | The ontology is openly available and may be used by all without constraint other than attribution. |
| [LOF-P-002](lof-p-002-format.md) | Common format | The ontology is released in OWL 2, with a stable primary release file. |
| [LOF-P-003](lof-p-003-bfo.md) | Common upper ontology | The ontology is aligned to Basic Formal Ontology, and every class descends from a BFO class. |
| [LOF-P-004](lof-p-004-grounding.md) | Explicit grounding of legal entities | Each top-level legal class states which BFO category it falls under, and why. |
| [LOF-P-005](lof-p-005-identifiers.md) | Persistent identifiers | Every entity has a persistent IRI in the `https://w3id.org/lof/` namespace, and IRIs are never reassigned or deleted. |
| [LOF-P-006](lof-p-006-versioning.md) | Versioning | Each release carries a version IRI and version number, and every earlier release remains resolvable. |
| [LOF-P-007](lof-p-007-definitions.md) | Textual definitions | Every class and relation has a precise, non-circular textual definition. |
| [LOF-P-008](lof-p-008-scope.md) | Clearly delineated scope | The ontology has a stated scope and a set of competency questions. |
| [LOF-P-009](lof-p-009-orthogonality.md) | Orthogonality | Member ontologies do not duplicate one another's content. |
| [LOF-P-010](lof-p-010-jurisdiction.md) | Jurisdictional transparency | Classes specific to a legal system or jurisdiction are marked as such and are not presented as universal. |
| [LOF-P-011](lof-p-011-consistency.md) | Logical well-formedness | Each release is logically consistent and contains no unsatisfiable classes. |
| [LOF-P-012](lof-p-012-naming.md) | Naming conventions | Labels are unique, singular, and follow a consistent lexical style. |
| [LOF-P-013](lof-p-013-documentation.md) | Documentation | The ontology has a public repository with documentation and an issue tracker. |
| [LOF-P-014](lof-p-014-maintenance.md) | Responsiveness and maintenance | Maintainers respond to issues and keep the ontology aligned with its dependencies. |
| [LOF-P-015](lof-p-015-standards.md) | Alignment with existing legal standards | The ontology documents its relationship to established legal information standards. |
| [LOF-P-016](lof-p-016-users.md) | Documented use | The ontology has documented users, or a credible plan for use. |
| [LOF-P-017](lof-p-017-authority.md) | Locus of authority | Each ontology has a single named point of contact responsible for it. |
| [LOF-P-018](lof-p-018-attribution.md) | Attribution | Contributors to the ontology are credited, and it can be cited. |

Checks that can be automated are listed on the [automated checks](../policy/automated-checks.md) page.
