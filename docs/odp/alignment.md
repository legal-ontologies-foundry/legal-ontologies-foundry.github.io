# Alignment with D-Acts and CCO

The Foundry patterns are grounded directly in BFO. Two **bridge modules** align
them with neighboring BFO-based ontologies, so that anyone already using those
ontologies can adopt the patterns without translation. A bridge holds alignment
axioms only; neither side is changed, and a user who does not need the
alignment simply does not import it. The alignments were proposed by William
Mandrick (issues #8 to #12).

## LOF to D-Acts bridge

The [Document Act Ontology](http://purl.obolibrary.org/obo/iao/d-acts.owl)
(Brochhausen, Hicks, Slaughter, Almeida and contributors) models social and
document acts after Reinach and Smith.

| LOF | D-Acts |
|---|---|
| legal role (ODP-002) | deontic role |
| role conferral act, role termination act (ODP-002) | deontic declaration |
| a role act *performed by means of* a legal document (ODP-001) | deontic document act |
| legal position (ODP-003) | deontic role |
| claim, duty, liberty, power (ODP-003) | claimant, duty holder, privilege holder, power role |
| a power *exercised in* a role conferral or termination act | deontic declaration performer role |

Not aligned, on purpose: ODP-001 *legal act* as a whole (an enactment
establishes legal content without creating or revoking a role); ODP-002 *role
modification act* (D-Acts' deontic declaration does not yet cover modifying a
role); and ODP-001 *legal document*, a material entity, with IAO *document*,
which is information content and corresponds to LOF legal content.

!!! note "Documents do not act"
    Persons and organizations perform legal acts. A document takes part in a
    legal act only as its instrument (*performed by means of*), as when a deed
    is executed; otherwise it at most *evidences* the act, and may be created
    afterward. So an appointment made by deed is a deontic document act, and an
    appointment that minutes merely record is not. No role or position is ever
    inferred from a document alone.

## LOF to CCO bridge

The [Common Core Ontologies](https://github.com/CommonCoreOntology/CommonCoreOntologies)
supply information entities, agents, and acts.

| LOF | CCO |
|---|---|
| legal content (ODP-001) | information content entity |
| legal norm (ODP-001) | process regulation; a norm that requires, prohibits, or permits is a process requirement, process prohibition, or action permission |
| legal definition (ODP-001) | descriptive information content entity |
| legal designator (ODP-001) | designative information content entity |
| legal act (ODP-001) | act |
| norm-establishing power (ODP-004) | authority role |
| legal document (ODP-001) | close match only: information bearing entity |

The patterns reuse CCO's information relations directly, rather than defining
their own: *is about*, *describes*, *designates*, *prescribes*, *requires*,
*prohibits*, and *permits*. Organizations and their members (ODP-002) are CCO's
*organization* and *organization member role*.

## Testing

Both bridges, with BFO 2020, all four patterns, D-Acts, and the CCO terms used,
are consistent and coherent under HermiT and within OWL 2 DL. Each bridge
repository has its test instances and a `make test` target.
