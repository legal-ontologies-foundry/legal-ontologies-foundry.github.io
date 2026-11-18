# Governance

!!! warning "Draft for ratification"
    This page takes effect when each founding coordinator has approved the
    pull request that adopts it.

The Foundry's structure follows the OBO Foundry model: an Operations Committee
with overall responsibility, and working groups that carry out the work.

## Operations Committee

During the founding phase the Operations Committee consists of the founding
coordinators:

- David R. Koepsell
- William Mandrick
- Barry Smith

The Operations Committee is responsible for the principles, the registry, the
`w3id.org/lof` namespace, admission decisions, and appointments to working
groups. It meets as needed and records decisions in this repository.

## Working groups

See [Working groups](working-groups.md).

## Voting members

The voting members are the members of the Operations Committee and the leads of
the working groups. They are marked on the [Members](../activity/members.md)
page.

## Decision-making

1. **Routine changes** (typo fixes, clarifications, new registry entries at
   *draft* status, updates to an ontology's own metadata) are adopted once one
   Operations Committee member approves and no voting member objects.
2. **Substantive changes** (new or amended principles or policies, admission
   to *accepted* status, changes to the identifier scheme, changes to this
   page) are adopted after a comment period of at least 14 days announced in
   Discussions, once all Operations Committee members approve and a majority of
   the voting members who vote approve.
3. The committee aims for consensus. A substantive change on which consensus
   cannot be reached is not adopted.

## How votes are cast

A proposal is opened for decision when a coordinator labels its pull request
`decision: routine` or `decision: substantive`. Voting members may vote in
either of two ways, which carry equal weight:

- **On the website,** using the personal ballot link emailed to them: approve,
  object, or abstain, with reasons if they wish; or
- **On GitHub,** by approving the pull request, or by requesting changes, which
  counts as an objection.

A member's most recent vote is the one that counts. Every vote is recorded
publicly on the pull request, and the current count is shown on the
[Open proposals](../activity/proposals.md) page. When the rule above is met,
the change is merged, by the Foundry's bot or by a coordinator, and appears in
the [decision log](../activity/decisions.md).

The pull-request history of this repository is the Foundry's official record
of decisions.

## Ontology status

The [metadata policy](../policy/metadata.md) defines the two status fields,
`status` (draft, candidate, accepted, deprecated) and `activity_status`
(active, inactive, orphaned). Status changes follow the
[review SOP](../sop/review.md).

## Transition beyond the founding phase

Once the Foundry has at least five accepted ontologies maintained by at least
three independent groups, the Operations Committee will propose a standing
structure with elected, rotating membership, for adoption under the rules
above.

## Conduct

All participation is governed by the [Code of Conduct](code-of-conduct.md).
