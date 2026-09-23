# SOP: Release

In the ontology repository:

1. Make sure CI is green on `main`.
2. Update `CHANGELOG.md` with the new version and date.
3. From `src/ontology/`, run `make release VERSION=x.y.z`. This regenerates
   `lof-{id}.owl` and `lof-{id}-base.owl` at the repository root, with
   version IRI and version info set.
4. Commit the release files and changelog: `git commit -am "Release x.y.z"`.
5. Tag and push: `git tag vx.y.z && git push && git push --tags`.
6. Optionally, create a GitHub release from the tag.
7. Check that `https://w3id.org/lof/{id}/releases/x.y.z/{id}.owl` resolves.

Use semantic versioning (LOF-P-006): PATCH for corrections to labels and
definitions, MINOR for new terms, MAJOR for changes that can alter inferences
over existing data.
