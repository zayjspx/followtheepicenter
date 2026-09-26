# Slice 3 return packet

Implemented on top of `interrogation-system-topology-complete-v0.2`.

## What is now in the repo

- public GitHub Pages React application;
- stable hash permalinks;
- focused semantic graph explorer with one- and two-hop dependency views;
- claim, receipt, source, and generic node pages;
- upstream **WHY?** traversal;
- downstream **WHAT DEPENDS ON THIS?** blast-radius traversal;
- claim structural-state and burden display;
- reviewed + machine-proposed diagnostics view;
- ratchet structural-order index;
- ratchet viewer with all locks, seven response branches, convergence burdens, activators, callbacks, response patterns, and closure states;
- static search;
- production compile mirror into `public/data/`;
- GitHub Pages deploy workflow on `main`;
- no operator/live mutation controls in this slice.

## On-disk smoke test

```sh
npm ci
npm run build
```

A successful build should leave the static site in `dist/`.

For local browsing:

```sh
npm run dev
```

`npm run dev` compiles the vault first, so the public data bundle is always current.

## Known implementation variance

The Phase-2 contract named Cytoscape.js. Package retrieval timed out in the sandbox, so this slice uses a deterministic dependency-free SVG focused-neighborhood renderer over the unchanged graph contract. See `docs/slice-3-architecture-conflicts.md`.
