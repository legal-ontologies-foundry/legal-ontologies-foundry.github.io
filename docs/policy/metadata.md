# Registry metadata

Each ontology in the registry is described by one file,
`ontology/{id}.md`, in the website repository. The file has YAML front matter
holding the metadata, followed by a Markdown body holding a longer
description. This is the same arrangement the OBO Foundry uses.

The front matter is validated against the JSON Schema in
`util/schema/registry_schema.json` on every pull request. From these files the
build generates:

- the [registry](../registry/index.md) page and one page per ontology,
- machine-readable registries at `registry/ontologies.yml` and
  `registry/ontologies.jsonld`,
- the `.htaccess` redirects for `w3id.org/lof`.

## Fields

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Lower-case identifier; must match the file name. |
| `preferred_prefix` | yes | Upper-case prefix for term IRIs. |
| `title` | yes | Full title. |
| `description` | yes | One-sentence description. |
| `domain` | yes | The part of legal reality covered. |
| `jurisdictions` | yes | Jurisdictions or traditions in scope, or `general` (LOF-P-010). |
| `status` | yes | `draft`, `candidate`, `accepted`, or `deprecated`. |
| `activity_status` | yes | `active`, `inactive`, or `orphaned`. |
| `repository` | yes | GitHub repository URL. |
| `tracker` | yes | Issue tracker URL. |
| `license` | yes | `label` and `url`. |
| `contact` | yes | `label`, `email`, and `github` (LOF-P-017). |
| `homepage` | no | Defaults to the repository. |
| `branch` | no | Release branch; defaults to `main`. |
| `dependencies` | no | List of `id`s: registry ids or `bfo`, `ro`, `iao`, `cco`. |
| `usages` | no | List of `description` and optional `url` (LOF-P-016). |
| `publications` | no | List of `id` (DOI or URL) and `title`. |
| `review` | no | `date` and `issue` URL of the review that set the status. |
| `replaced_by` | no | For deprecated ontologies, the successor's `id`. |

## Status

| `status` | Meaning |
|---|---|
| draft | Registered and under development. The prefix is reserved. |
| candidate | Submitted for review against the principles. |
| accepted | Reviewed and found to satisfy the principles. |
| deprecated | Superseded or no longer maintained. Identifiers remain resolvable. |

| `activity_status` | Meaning |
|---|---|
| active | Maintainers are responsive and releases are current. |
| inactive | No release or issue activity for 12 months. |
| orphaned | Maintainers have withdrawn; new maintainers sought. |
