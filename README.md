# Legal Ontologies Foundry: website

Source for the Foundry website, published at
https://legal-ontologies-foundry.github.io/ (or the custom domain, once set).

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
