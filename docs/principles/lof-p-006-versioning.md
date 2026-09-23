# LOF-P-006: Versioning

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Each release carries a version IRI and version number, and every earlier release remains resolvable.

## Purpose

Legal analysis is often retrospective. Users must be able to retrieve exactly the version of an ontology that was in force when data was annotated.

## Recommendations and requirements

1. Each release declares `owl:versionIRI` of the form `https://w3id.org/lof/{id}/releases/{version}/{id}.owl` and `owl:versionInfo`.
2. Version numbers follow semantic versioning (MAJOR.MINOR.PATCH). A MAJOR increment signals a change that can alter inferences over existing data.
3. Each release is tagged `v{version}` in the repository, and the change is recorded in `CHANGELOG.md`.

## Implementation

`make release VERSION=x.y.z` sets both annotations. Then tag and push.

## Examples

`https://w3id.org/lof/odp-001/releases/0.1.0/odp-001.owl`

## Criteria for review

The version IRI resolves to the tagged file, and the changelog describes the release.

**Automated check:** Version IRI resolution is tested during review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-006-versioning.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
