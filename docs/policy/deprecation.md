# Deprecation policy

Terms are never deleted (LOF-P-005). A term that should no longer be used is
**deprecated**, following the same conventions as the OBO Foundry's
obsoletion policy.

## When to deprecate

- The term's meaning must change. Deprecate it and mint a new term.
- The term duplicates another term, in this or another member ontology
  (LOF-P-009).
- The term was created in error, or is out of scope.

Changes to a label or a definition that do not change the term's meaning do
not require deprecation.

## How to deprecate

1. Add `owl:deprecated true`.
2. Prefix the label with `obsolete ` (for example, "obsolete legal duty").
3. Remove all logical axioms in which the term appears (subclass axioms,
   equivalences, restrictions), so it no longer affects reasoning.
4. Add one of the following:
    - `IAO:0100001` (*term replaced by*) pointing to the single replacement term, or
    - `oboInOwl:consider` pointing to one or more candidate terms, when there
      is no exact replacement.
5. Add an `rdfs:comment` explaining why, with a link to the issue.
6. Record the deprecation in `CHANGELOG.md`.

The automated check `deprecated-without-replacement-violation` enforces step 4.

## Deprecating an ontology

An ontology that is no longer maintained or has been superseded is set to
`status: deprecated` in the registry, with `replaced_by` naming its successor
if there is one. Its identifiers and releases remain resolvable indefinitely.
