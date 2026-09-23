# LOF-P-010: Jurisdictional transparency

!!! warning "Draft for ratification"
    Part of the founding draft of the [LOF principles](index.md).

## Summary

Classes specific to a legal system or jurisdiction are marked as such and are not presented as universal.

## Purpose

Legal categories vary across systems. A class that silently generalizes from one jurisdiction ("consideration" in common-law contract, say) misrepresents others and produces false inferences when data from several systems is combined.

## Recommendations and requirements

1. The registry entry lists the jurisdictions or legal traditions in scope (`jurisdictions`), or `general` if the ontology claims generality.
2. Classes restricted to particular jurisdictions carry a `dcterms:coverage` annotation naming them.
3. Claims of cross-jurisdictional generality are supported by documentation.

## Implementation

Use jurisdiction identifiers in the form `ISO 3166` country codes or named traditions (for example, `common-law`, `civil-law`), and be consistent within the ontology.

## Examples

A class *consideration* annotated with `dcterms:coverage "common-law"`.

## Criteria for review

Jurisdiction-specific classes are annotated. The ontology's generality claims are plausible given its sources.

**Automated check:** None. Manual review.

## Feedback and discussion

Propose changes to this principle by pull request against
`docs/principles/lof-p-010-jurisdiction.md`, or open a thread in
[Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
