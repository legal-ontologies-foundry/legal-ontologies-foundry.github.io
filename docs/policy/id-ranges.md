# ID ranges

To stop two editors from minting the same identifier, each editor of an
ontology is allocated a range of seven-digit numbers. Allocations are recorded
in `src/ontology/lof-{id}-idranges.owl` in the ontology's repository, in the
format used by the OBO Foundry and the Ontology Development Kit.

## Default allocation

| Range | Use |
|---|---|
| 0000001 to 0000999 | Reserved |
| 0001000 to 0001999 | First editor |
| 0002000 to 0002999 | Second editor |
| 0003000 to 0003999 | Third editor |
| 0004000 and above | Allocated on request |

## Protégé setup

In Protégé, open **Preferences > New Entities** and set:

- **Entity IRI:** *Start with* Specified IRI `https://w3id.org/lof`, *Followed by* `/`, *End with* Auto-generated ID.
- **Entity Label:** Custom label, `rdfs:label`.
- **Auto-generated ID:** Numeric (iterative), prefix `{PREFIX}_`, 7 digits, starting at the beginning of your range, and ending at its end.

To request a range, open an issue in the ontology's repository, or ask its
contact person.
