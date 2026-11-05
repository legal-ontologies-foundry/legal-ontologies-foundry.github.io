# LOF-P-010: Jurisdictional transparency

!!! success "Adopted"
    Adopted by the members after public comment, as part of the founding set of
    [LOF principles](index.md). The decision is recorded in the [decision log](../activity/decisions.md).

## Summary

Classes specific to a legal system or jurisdiction carry a `dcterms:coverage` annotation naming it, and are not presented as universal.

## Purpose

Legal categories vary across systems. A class that silently generalizes from one jurisdiction ("consideration" in common-law contract, say) misrepresents others and produces false inferences when data from several systems is combined.

## Recommendations and requirements

1. The registry entry lists the jurisdictions or legal traditions in scope (`jurisdictions`), or `general` if the ontology claims generality.
2. Classes restricted to particular jurisdictions carry a `dcterms:coverage` annotation naming them.
3. Claims of cross-jurisdictional generality are supported by documentation.

## Implementation

Mark each such class with one `dcterms:coverage` annotation per jurisdiction or tradition, using these values:

| Scope | Value | Example |
|---|---|---|
| A country | ISO 3166-1 alpha-2 code | `"BR"` (Brazil) |
| A subdivision (state, province) | ISO 3166-2 code | `"US-TX"` (Texas) |
| The European Union | `"EU"` | `"EU"` |
| A legal tradition | one of `common-law`, `civil-law`, `religious-law`, `customary-law`, `international-law` | `"common-law"` |

A class with no `dcterms:coverage` annotation is presented as general, so the annotation is required, not optional, for every class whose definition depends on a particular legal system.

## Examples

A class *consideration* annotated with `dcterms:coverage "common-law"`.

## Criteria for review

Jurisdiction-specific classes are annotated. The ontology's generality claims are plausible given its sources.

**Automated check:** none yet; a check of `dcterms:coverage` values against the table above is planned. Whether a class *needs* the annotation remains a matter for manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-010-jurisdiction.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
