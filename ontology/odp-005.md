---
id: odp-005
preferred_prefix: ODP005
title: "LOF-ODP-005: Legal Time and Versions"
description: Gives legal content periods in force and of application, records amending acts, repeals and succession of content, distinguishes consolidated versions, and gives legal positions the periods within which they must be discharged.
domain: legal ontology design pattern
jurisdictions:
  - general
status: draft
activity_status: active
repository: https://github.com/legal-ontologies-foundry/lof-odp-005
tracker: https://github.com/legal-ontologies-foundry/lof-odp-005/issues
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
usages: []
publications: []
---

Gives legal content periods in force and periods of application (kept apart, since they come apart), records the acts that amend and repeal it, distinguishes consolidated versions from the law they consolidate, and gives legal positions compliance periods computed from the occurrences that start them, with region bounds as BFO instants carrying time-zoned date-times. With LOF-ODP-004, it identifies overdue positions. The full specification is on the [pattern page](../odp/odp-005.md).
