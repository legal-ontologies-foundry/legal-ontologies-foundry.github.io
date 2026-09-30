# Legal Ontologies Foundry

The Legal Ontologies Foundry (LOF) is an open, collaborative initiative to
develop and coordinate interoperable ontologies of law and legal practice,
grounded in Basic Formal Ontology (BFO).

**Website:** https://legal-ontologies-foundry.github.io

## Current status: forming the consortium

The Foundry is in its founding stage. **No member ontologies are available for
download yet.** Over the coming months we are doing three things:

1. **Finalizing our governance structure.** Our
   [principles](https://legal-ontologies-foundry.github.io/principles/) and
   [governance](https://legal-ontologies-foundry.github.io/about/governance/)
   are published as drafts awaiting ratification. They will change in response
   to community feedback before they are adopted.
2. **Building the community.** We are inviting ontology developers, legal
   scholars, practitioners, and information scientists to take part in
   shaping the Foundry.
3. **Gathering candidate ontologies.** We welcome submissions of existing or
   planned ontologies in the legal domain for consideration as founding
   members.

Draft [ontology design patterns](https://legal-ontologies-foundry.github.io/odp/)
are posted for discussion. They are working proposals, not releases.

## How to get involved

- **Comment on the drafts.** Each principle and design pattern page on the
  website has a discussion thread. You can also join the conversation in
  [Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions).
- **Submit an ontology for consideration.** If you maintain a BFO-based
  ontology relevant to law, open a
  [new ontology request](https://legal-ontologies-foundry.github.io/sop/new-ontology-request/).
  Ontologies are registered at draft status once scope and prefix are agreed,
  so nothing needs to be finished or fully compliant to start. You keep
  ownership of your work, your repository, and your license.
- **Help shape governance.** Early participants will help decide how the
  Foundry reviews ontologies, resolves overlaps, and makes decisions.
  Comments on the draft principles are especially welcome now, before
  ratification.

## Contact

The Foundry is coordinated by its co-founders, William Mandrick, Barry Smith,
and David R. Koepsell. For questions, open a thread in Discussions or write to
drkoepsell@tamu.edu.

## License

Unless otherwise noted, content on the website is licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
# Legal Ontologies Foundry: website

Source for the Foundry website, published at
https://legal-ontologies-foundry.github.io/ 

- Pages are Markdown files in `docs/`.
- Each registered ontology is described by `ontology/{id}.md` (YAML front
  matter plus a description), validated against
  `util/schema/registry_schema.json`. `scripts/build_registry.py` generates the
  registry pages, machine-readable registries, and the w3id `.htaccess`
  (`build/w3id/lof/.htaccess`). Never edit the generated files.
- Every push to `main` rebuilds and publishes the site
  (`.github/workflows/deploy.yml`). Pull requests are test-built with
  `mkdocs build --strict` (`.github/workflows/check.yml`).

## Local preview

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python scripts/build_registry.py
mkdocs serve
```

Then open http://127.0.0.1:8000

## Static copy for FTP hosting

```bash
python scripts/build_registry.py
mkdocs build
```

Upload the contents of `site/` to any static host.

## License

CC BY 4.0. See `LICENSE`.
