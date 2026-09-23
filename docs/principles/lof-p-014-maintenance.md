# LOF-P-014: Responsiveness and maintenance

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Maintainers respond to issues and keep the ontology aligned with its dependencies.

## Purpose

Legal ontologies must track changes in law and in the ontologies they import. An unmaintained ontology gradually becomes wrong.

## Recommendations and requirements

1. Maintainers respond to new issues within 30 days.
2. The ontology is updated to the current release of BFO and of any member ontology it imports within a reasonable period of their release.
3. An ontology whose maintainers cannot continue is marked `orphaned` in the registry, and the coordinators seek new maintainers.

## Implementation

Watch the repositories of imported ontologies, and schedule periodic `make imports` refreshes.

## Examples

See the LOF ontology template.

## Criteria for review

Issue response history and the date of the last import refresh.

**Automated check:** None yet. Issue-activity metrics are planned.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-014-maintenance.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
