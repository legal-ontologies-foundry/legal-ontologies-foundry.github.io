# Contributing

Everything on this site is edited through GitHub, so every change has a
recorded author, rationale, and review.

## Editing a page

1. Click the pencil icon at the top of any page.
2. GitHub opens the Markdown source. Make your edit.
3. Describe the change and choose **Propose changes**. This creates a pull
   request.
4. A coordinator reviews and merges it, and the site rebuilds automatically.

The registry and ontology detail pages are generated: to change them, edit
the ontology's metadata file in `ontology/` instead.

## Local preview

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python scripts/build_registry.py
mkdocs serve
```

## Where things go

| Contribution | How |
|---|---|
| Idea or open question | [Discussions](https://github.com/legal-ontologies-foundry/legal-ontologies-foundry.github.io/discussions) |
| New ontology | [New ontology request SOP](sop/new-ontology-request.md) |
| Change to a principle or policy | Pull request, plus an announcement in Discussions (see [Governance](about/governance.md)) |
| New term or term fix | The ontology's own tracker (see [Term requests](sop/term-requests.md)) |
| Ontology review | [Review SOP](sop/review.md) |
