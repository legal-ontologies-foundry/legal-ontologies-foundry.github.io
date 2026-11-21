---
id: odp-004
preferred_prefix: ODP004
title: "LOF-ODP-004: Minimum Legal Chain"
description: Connects the authority, norm, role, trigger, act, target, effect, and remedy through which a legal position comes to exist.
domain: legal ontology design pattern
jurisdictions:
  - general
status: accepted
activity_status: active
release:
  version: 0.2.0
  tag: v0.2.0
review:
  date: "2026-11-18"
  issue: https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/pull/13
repository: https://github.com/legal-ontologies-foundry/lof-odp-004
tracker: https://github.com/legal-ontologies-foundry/lof-odp-004/issues
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
usages:
  - description: "Planned: chain-closure validation of Minimum Legal Chain annotations of federal appellate opinions (SEAL Lab, Texas A&M)."
publications: []
---

Connects the classes of LOF-ODP-001 to 003 into the chain through which a particular legal position comes to exist, adds relations for triggers, generation, targets, remedies, and omission, and defines a class for positions whose chain is complete. Companion SHACL shapes report incomplete chains node by node. Adapted from the Minimum Legal Chain of *A Structural Ontology of the Law*. The full specification is on the [pattern page](../odp/odp-004.md).
