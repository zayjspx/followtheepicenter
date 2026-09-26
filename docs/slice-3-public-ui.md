# Slice 3 — Public GitHub Pages application

Status: implemented in source, pending operator-side `npm ci && npm run build` smoke test.

## Public routes

GitHub Pages uses hash permalinks so every route works on a static host without rewrite rules:

- `#/` — public overview
- `#/graph?focus=<node-id>&depth=1|2` — focused semantic graph
- `#/claims` — atomic claim browser
- `#/claim/<id>` — claim detail
- `#/receipt/<id>` — receipt detail and preserved source
- `#/source/<id>` — source preservation metadata
- `#/node/<id>` — generic node detail
- `#/ratchets` — structural interrogation order
- `#/ratchet/<id>` — ratchet, locks, branches, convergence burdens and callbacks
- `#/diagnostics` — reviewed diagnostics plus machine-proposed candidates
- `#/sources` — preserved source registry
- `#/search` — client-side graph search

## Provenance actions

Every node detail page exposes two canonical traversals:

- **WHY?** — direct compiled provenance dependencies and source roots.
- **WHAT DEPENDS ON THIS?** — downstream claims and ratchets from the dependency blast-radius artifact.

Neither traversal is presented as a truth judgment.

## Static data boundary

`vault/` remains canonical. `npm run compile` writes the ordinary generated files to `dist-data/` and mirrors the same generated JSON into `public/data/` for the read-only Pages app. Vite copies `public/data/` into the final static site. The UI has no backend and does not mutate the vault.

## Ratchet rendering

The public ratchet page renders:

- entry lock,
- exact question for each lock,
- all seven response branches,
- convergence burdens,
- activating claims,
- cross-ratchet callbacks,
- handled response patterns,
- closure states.

There are no live/operator controls in Slice 3.

## Graph rendering implementation note

The Phase-2 implementation contract named Cytoscape.js. The current sandbox could not retrieve an additional npm dependency, so Slice 3 uses a deterministic dependency-free SVG neighborhood renderer against the exact same compiled graph. This is an implementation-layer variance only; node, edge, provenance, route, and UI semantics are unchanged. The renderer is deliberately focused rather than a full 387-record hairball: one selected node sits at center, compiled upstream dependencies render left, and direct downstream dependents render right, with optional two-hop expansion.

If strict Cytoscape conformance is required later, the SVG renderer can be replaced without changing the public data contract or route model.
