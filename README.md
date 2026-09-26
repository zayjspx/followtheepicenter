# Debunker / Interrogation System — Bray case graph

This repository implements a provenance-preserving forensic claim-interrogation system. The canonical `vault/` compiles attributed claims, receipts, observations, measurements, assumptions, derivations, burdens, diagnostics, theory versions, locks, ratchets, and first-class semantic edges into a permanent public case site suitable for GitHub Pages.

The primary public experience is now **self-guided**: a visitor can choose a claim, walk the authored Ratchet, choose the strongest response at each Lock, inspect what that response changes, and see what support still survives. The canonical case graph remains read-only.

## Product posture

One substrate, three depths:

1. **Guided** — plain-language, self-guided claim examination. This is the default public product and the natural continuation of the original Debunker concept.
2. **Explore** — claim, receipt, source, WHY?, WHAT DEPENDS ON THIS?, search, and direct permalinks.
3. **Technical** — full graph, Ratchet topology, diagnostics, derivations, and dependency blast radius.

The local operator/session runtime remains available as an optional tool for conducting a real conversation, but there is no active roadmap requirement for synchronized live audience/viewer UX. During a debate the same permanent self-guided site can be opened, linked, or navigated directly.

## Current implementation

Completed foundations:

- canonical Markdown/YAML evidence vault;
- immutable source preservation with hashes and precise receipts;
- executable derivations;
- deterministic audit engine;
- completed interrogation topology and response-pattern layer;
- dependency blast radius;
- structural interrogation order;
- public GitHub Pages application;
- self-guided Debunker runtime over the authored Ratchets;
- optional local event-sourced operator/replay tools.

### Self-guided Debunker

- `#/guided` — choose a guided examination by domain/claim;
- `#/guided/<ratchet-id>` — walk one Ratchet interactively;
- branch selection is hypothetical and browser-local;
- simple/technical mode switch;
- preserved source receipts shown at the active Lock;
- "what this answer changes" structural preview;
- surviving authored support remains visible;
- downstream blast radius stays visible without pretending descendants become false;
- reviewed diagnostics appear at the relevant step;
- local path/resume state uses `localStorage` only;
- exact current-step permalinks via `?lock=<lock-id>`;
- claim pages link directly into every guided Ratchet that targets them.

### Explore / technical site

- focused semantic graph explorer;
- atomic claim browser and detail pages;
- receipt/source detail pages;
- **WHY?** upstream provenance traversal;
- **WHAT DEPENDS ON THIS?** downstream blast-radius traversal;
- reviewed and machine-proposed diagnostics;
- Ratchet index and full Ratchet/Lock branch viewer;
- static client-side search;
- stable hash permalinks compatible with GitHub Pages.

### Optional local session tools

- `#/operator` — activate Ratchets/Locks, classify actual answers, record commitments, park tangents, manage burdens, surface callbacks, and export a session.
- `#/replay` — reconstruct session state at any event sequence.

These tools do not mutate the public graph and are deliberately not primary navigation.

## Canonical-data boundary

`vault/` is canonical. Generated JSON is not.

Production compilation emits:

```text
dist-data/graph.json
dist-data/provenance.json
dist-data/diagnostics.json
dist-data/topology.json
dist-data/dependency-blast-radius.json
dist-data/interrogation-order.json
dist-data/build-manifest.json
```

The same build is mirrored to `public/data/` so the static site can load it. `public/data/` and generated `dist-data/*.json` are ignored by Git.

## Build locally

```sh
npm ci
npm run compile
npm run dev
```

Production smoke test:

```sh
npm run build
```

Full compiler/audit suite:

```sh
npm run verify
```

## GitHub Pages

The Pages workflow builds on pushes to `main` and can also be started manually. It runs `npm ci`, `npm run build`, uploads `dist/`, and deploys it through GitHub Pages.

Hash-route permalink examples:

```text
#/guided/rat-itd-nearfield
#/guided/rat-itd-nearfield?lock=lck-itd-baseline
#/claim/clm-itd-nearfield-only
#/receipt/rec-itd-nearfield
#/ratchet/rat-itd-nearfield
#/graph?focus=clm-itd-nearfield-only&depth=2
```

## Interpretation rule

The graph models support, dependency, provenance, burdens, tensions, and diagnostics. A weakened or removed support path does not automatically mean a downstream proposition is false. Guided branches preserve this distinction: they preview a structural what-if without changing canonical evidence or assigning a truth score.

See `docs/slice-5-self-guided-debunker.md` for the public guided contract.
