# Changes in 0.2.0

Version 0.2.0 of the four patterns adopts William Mandrick's review comments as
fully as the patterns allow. Thank you, Bill. Every change below was tested
with HermiT, alone and together with both bridges, and stays within OWL 2 DL.

| Proposal | What changed | Where |
|---|---|---|
| Adopt D-Acts deontic declaration and deontic document act (#8) | Role conferral and termination acts are deontic declarations; one performed by means of a document is a deontic document act. New ODP-001 relations *performed by means of* and *evidences* | [ODP-001](odp-001.md), [Alignment](alignment.md) |
| Adopt D-Acts deontic roles (#9) | Legal positions are now BFO roles, resolving ODP-003's placement question; claim, duty, liberty, and power align with the D-Acts roles; new relation *succeeds* for assignment and transfer of office | [ODP-003](odp-003.md) |
| Adopt CCO information content entities (#10) | New ODP-001 kinds of legal content: *legal norm*, *legal definition*, *legal designator*, aligned with CCO | [ODP-001](odp-001.md), [Alignment](alignment.md) |
| Adopt is about, describes, designates, prescribes, permits, prohibits, requires (#11) | Reused from CCO, not redefined | [Alignment](alignment.md) |
| Relate higher law to its regulations (#12) | New ODP-004 relations *legal basis for*, *derives authority from*, and *delegates legal authority to*, all inferred from the chain of authority | [ODP-004](odp-004.md) |
| ODP 2 slide: modifies; organizations; time | New *role modification act*; organizations and members from CCO; acts dated by the temporal regions they occupy | [ODP-002](odp-002.md) |
| ODP 2 slide: the act "realizes" | The act realizes the power exercised in it (*exercised in* is now a subproperty of BFO *realized in*), the D-Acts deontic declaration performer role | [ODP-003](odp-003.md) |
| Change of command: one role, two bearers | A legal role now has exactly one bearer; the incoming commander's authority *succeeds* the outgoing commander's | [ODP-002](odp-002.md), [ODP-004](odp-004.md) |

## Not adopted, and why

- **Affordance** (from the list of position-related classes). BFO's realizable
  entity is already the parent of roles; affordance does not fit legal
  positions and is left for later discussion.
- **Legal act as a whole under deontic declaration.** Enactments establish
  legal content without creating or revoking a role.
- **Legal document under IAO document or CCO information bearing entity.** A
  category difference: IAO's document is information content, and CCO's
  information bearing entity is an object, while a legal document may be a
  pattern in a storage medium. Recorded as a close match.

## For the next meeting

1. Is legal content one way of fixing the "normative expectations" in which,
   by D-Acts' definition, a deontic role is "exclusively" grounded?
2. Which CCO release should the bridge track? (Drafted against September 2026.)
3. Should we ask the D-Acts maintainers to add "modifies" to deontic
   declaration, as their power role already says "altering"?
4. Punning for the kind of conduct a norm prescribes: confirm as the
   Foundry's convention.
