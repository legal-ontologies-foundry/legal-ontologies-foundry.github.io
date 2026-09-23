# Identifier policy

All Foundry identifiers live in the persistent namespace
`https://w3id.org/lof/`. The redirects are maintained in the
[w3id.org repository](https://github.com/perma-id/w3id.org/tree/master/lof)
and generated from the registry, so hosting can change without breaking any
identifier (LOF-P-005).

## Patterns

| Kind | Pattern | Example |
|---|---|---|
| Foundry home | `https://w3id.org/lof/` | |
| Full release (latest) | `https://w3id.org/lof/{id}.owl` | `https://w3id.org/lof/odp-001.owl` |
| Base release (latest) | `https://w3id.org/lof/{id}/{id}-base.owl` | `https://w3id.org/lof/odp-001/odp-001-base.owl` |
| Specific release | `https://w3id.org/lof/{id}/releases/{version}/{id}.owl` | `https://w3id.org/lof/odp-001/releases/0.1.0/odp-001.owl` |
| Import module | `https://w3id.org/lof/{id}/imports/{file}` | `https://w3id.org/lof/odp-001/imports/bfo_import.owl` |
| Term | `https://w3id.org/lof/{PREFIX}_{7 digits}` | `https://w3id.org/lof/ODP001_0001000` |
| Issue tracker | `https://w3id.org/lof/{id}/tracker` | |
| Home page | `https://w3id.org/lof/{id}/home` | |

`{id}` is the lower-case registry identifier. `{PREFIX}` is the upper-case
prefix reserved in the [registry](../registry/index.md).

## Rules

1. Local identifiers are opaque seven-digit numbers. They never encode labels.
2. An identifier, once published in a release, is never reassigned and never
   deleted. See the [deprecation policy](deprecation.md).
3. Each editor mints identifiers only from their allocated
   [ID range](id-ranges.md).
4. Prefixes are reserved when an ontology is registered at *draft* status and
   remain reserved even if it is deprecated.

## Term resolution

Term IRIs currently redirect to the ontology's page in the registry. When a
term browser is deployed (for example, an OLS or Ontobee instance), the term
redirects will be updated to point at it, with no change to the IRIs.
