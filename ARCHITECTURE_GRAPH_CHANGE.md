# Graph experience: architecture boundary

No canonical schema, ontology, first-class edge semantics, source artifact, diagnostic review state, or ratchet branch was modified.

The user requested the graph-first interface and browser-local ratchet experience after inspecting the published RC1. This supersedes the earlier restriction against adding frontend capabilities during the RC1 release-engineering pass.

Renderer links labelled as field references expose existing `targets`, `burdens`, `receipts`, `locks` and `convergence` fields. They are not additional proof edges or independent evidence. Semantic edges retain their authored direction and relation.

The new event stream is a distinct hypothetical walk, not an authoritative Operator session. The canonical graph and the existing Operator event schema remain untouched. Local proposal and resolution records are explicitly user assessments.

No architecture conflict requiring an ontology change was encountered. One deliberate limit remains: full supported/partially-supported/unsupported proof evaluation cannot safely be inferred from dependency ancestry alone. This build reports affected paths and review obligations instead. Adding a Boolean support model would require an explicit architecture/content decision, not a cosmetic renderer change.
