# SOP: New ontology request

1. **Check the registry.** Make sure no existing ontology already covers the
   scope (LOF-P-009).
2. **Open a request.** Use the **New ontology request** issue form in the
   website repository. You will be asked for a title, requested prefix, scope
   statement, competency questions, jurisdictions, planned use, and contact.
3. **Scope discussion.** An Editorial Working Group member responds, usually
   within 30 days, checking for overlap and agreeing the prefix.
4. **Register at draft status.** Once scope and prefix are agreed, open a pull
   request adding `ontology/{id}.md` with `status: draft`. A coordinator
   merges it. The prefix is now reserved, and the `w3id.org/lof` redirects are
   regenerated.
5. **Create the repository.** Create `lof-{id}` in the Foundry organization
   (or link your own), and initialize it from the ontology template with
   `./init.sh`.
6. **Develop.** Follow the principles. Keep CI green.
7. **Request review.** When ready, follow the [review SOP](review.md).
