# Adopting principles

!!! warning "Proposed"
    This procedure takes effect when the pull request that adds it is adopted as a substantive change
    under the [Governance](governance.md) page.

The [principles](../principles/index.md) are the commitments every Foundry ontology makes, so they are
decided by the Foundry's **members** after **public comment**, not by the Operations Committee alone.

## The procedure

1. **Proposal.** Anyone may propose a new principle or a change to one, as a pull request against the
   principle's page, or through the website's [participation form](../activity/participate.md). A
   coordinator opens it for decision by labeling the pull request `decision: principle`.
2. **Public comment: 14 days.** Anyone can comment, members and non-members alike, on GitHub or through
   the website without a GitHub account. The proposal appears under
   [Open for decision](../activity/proposals.md) and in the weekly digest. Comments from non-members are
   advisory: they inform the members' decision but do not stop or start a vote.
3. **Adoption by default.** If **no member objects** by the end of the comment period, the principle is
   adopted.
4. **Member vote: 14 more days.** If **any member objects** during the comment period, the members
   vote for a further 14 days. The principle is adopted if **more members approve than object**, with a
   **quorum of at least 5 votes** cast, counting abstentions. Otherwise it is not adopted, and the
   proposal is closed with the result recorded. A revised proposal may be opened at any time.

Members vote as members: Operations Committee members have one vote each, like everyone else. A
member's latest vote is the one that counts, and a member who objected can withdraw the objection by
voting again before the comment period ends.

## How members take part

- **Members** are those listed on the [Members](../activity/members.md) page. Anyone may
  [join](../activity/participate.md).
- Members whose email address the Foundry has receive a **personal ballot link** when a principle
  opens for decision, and can [sign in](../activity/signin.md) to vote on the proposal's page.
- Members with a GitHub account can also vote on the pull request: **approve** to approve, **request
  changes** to object.
- Every vote is posted publicly on the pull request under the member's name.

## Timeline

| Day | What happens |
|---|---|
| 0 | Opened for decision; ballot links emailed to members; listed on the website and in the digest |
| 0 to 14 | Public comment. Any member may object. |
| 14 | No member objection: **adopted by default**. Otherwise the member vote continues. |
| 14 to 28 | Member vote |
| 28 | Adopted if more approve than object and at least 5 votes were cast; otherwise **not adopted** |

The rule is recorded in [`community/decision-rules.json`](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/blob/main/community/decision-rules.json),
which the website and the Foundry's bot both read, so the count shown on the site is the one that decides.

## The founding principles

The founding draft of the principles is ratified as the Governance page provides. Once this procedure is
adopted, the founding coordinators may instead put the founding set through it, so that members and the
public have their say before the principles take effect.
