# Slice 5 — Self-Guided Debunker

Implemented directly on top of Slice 4.

## Implemented

- Self-guided Debunker is now the primary public UX.
- New `#/guided` index grouped by domain.
- New `#/guided/<ratchet-id>` interactive Ratchet execution.
- Simple / Technical display modes.
- Exact claim-under-examination display from canonical target nodes.
- Active burden explanation from canonical burden nodes.
- Preserved receipt excerpts displayed at the relevant Lock.
- All seven authored response branches available.
- "What this answer changes" structural preview.
- Downstream blast-radius count and links without automatic falsification language.
- Surviving authored support paths remain visible after a hypothetical challenge.
- Reviewed diagnostics surfaced at the relevant step.
- Local branch trail, back/reset, and resume persistence.
- Shareable current-step permalinks using `?lock=`.
- Claim detail pages now link directly into Guided examinations.
- Claims index shows whether a claim has Guided examinations.
- Home page repositioned around Guided / Explore / Technical depths.
- Operator/Replay preserved but removed from primary navigation.
- Live audience/viewer synchronization explicitly deferred from the active roadmap.
- Pure guided-runtime helpers and unit tests added.

## No canonical-data mutation

No vault ontology, claim content, edge vocabulary, diagnostics, Ratchets, or source evidence were changed by this slice. It is a projection/runtime layer over the existing compiled case graph.

## Disk smoke test

```bash
npm ci
npm run build
npm test
npm run dev
```
