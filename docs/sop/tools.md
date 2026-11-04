# Tools

Tools for seeing and checking ontologies before you propose them to the Foundry. All are free. The
two marked † were built by a founding coordinator, David Koepsell.

## Visualization

| Tool | What it is | When to use it |
|---|---|---|
| [owl2uml](https://owl2uml.davidkoepsell.com/) † | Web app that draws an OWL file as a UML class diagram | To see the shape of a pattern or a small ontology at a glance: drop the file in, no installation. |
| [WebVOWL](https://service.tib.eu/webvowl/) | Web app that draws an ontology as an interactive graph (VOWL notation) | To explore a larger ontology interactively, or to show its structure to non-ontologists. |
| [Protégé](https://protege.stanford.edu/) | Desktop ontology editor, with class-hierarchy and graph views | To edit an ontology and browse its hierarchy, and as the usual home for running a reasoner by hand. |

The [design pattern pages](../odp/index.md) also carry a diagram of each pattern, drawn automatically
from the pattern's tables every time the site is built.

## Validation

| Tool | What it is | When to use it |
|---|---|---|
| [OwlTester](https://ontology.davidkoepsell.com/) † | Web app that checks an OWL file against BFO and common modeling errors, in plain language | For a quick first check of BFO conformance before asking anyone to review, no installation. |
| [HermiT](http://www.hermit-reasoner.com/) | OWL 2 DL reasoner (built into Protégé and ROBOT) | To check that an ontology is consistent and has no unsatisfiable classes (principle LOF-P-011), and to see what follows from its axioms. |
| [ROBOT](https://robot.obolibrary.org/) | Command-line tool from the OBO community for reasoning, quality reports, SPARQL checks, extracts, and releases | For the Foundry's [automated checks](../policy/automated-checks.md) and for building releases; this is what the Foundry's own checks run. |
| [pySHACL](https://github.com/RDFLib/pySHACL) | Python validator for SHACL shapes | To check instance data (worked examples, test cases) against shapes, with messages written for people rather than reasoner output. |

## Suggest a tool

Know a tool that should be here? Propose it through the
[participation form](../activity/participate.md), or comment on the page below.
