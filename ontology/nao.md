---
id: nao
preferred_prefix: NAO
title: Normative Accountability Ontology (NAO)
description: Being held to account. Norms and their breaches, the residue a breach leaves, the capacities that make an agent answerable, the responses by which breaches are answered, and the displacement of answerability from resettable artifacts to those who deploy them.
domain: normative accountability (legal, moral, professional, and institutional norms)
jurisdictions:
  - general
status: draft
activity_status: active
repository: https://github.com/legal-ontologies-foundry/lof-nao
tracker: https://github.com/legal-ontologies-foundry/lof-nao/issues
license:
  label: CC BY 4.0
  url: https://creativecommons.org/licenses/by/4.0/
contact:
  label: David R. Koepsell
  email: drkoepsell@tamu.edu
  github: dkoepsell
dependencies:
  - id: bfo
  - id: odp-001
  - id: odp-002
  - id: odp-003
  - id: odp-004
usages:
  - description: "Worked example: three scenarios from the classroom demonstration The Reset Button (a physician, a resettable diagnostic system, a permanent AI, and an autonomous probe), with a plain-language accountability report"
publications:
  - id: "Koepsell, A Structural Ontology of the Law (Palgrave, forthcoming)"
    title: The Irreversible Accountability Test
---

A BFO 2020 ontology of being held to account, published in two modules. **NAO core** (23 classes, 12
relations, five patterns) commits to nothing beyond BFO and the LOF design patterns, and can be used by
anyone modeling accountability. **NAO-IAT** adds the Irreversible Accountability Test as two exclusion
axioms, so that the thesis can be adopted, tested, or left aside separately from the vocabulary.

NAO links to the legal patterns through *codified as* (a moral answerability codified as an LOF-ODP-003
legal position) and LOF-ODP-004 (a breach that triggers that position is inferred to be a triggering
occurrence). The scope discussion is in the new ontology request issue.
