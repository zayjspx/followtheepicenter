# Release candidate 1 — integration verification

This release uses the supplied `interrogation-system-slice-5-self-guided-debunker.zip` as its authority. The permanent self-guided Debunker remains the primary product. Explore and the local Operator/Replay tools remain available. No new feature slice was started.

## Repairs

- Production compilation previously stopped on `Unsupported unit: px`, although the synthetic tests passed. The arithmetic evaluator now tracks pixels as a separate image dimension. Pixel ratios can cancel to dimensionless values; pixels cannot silently become physical lengths. Calibration detection continues to distinguish image and physical quantities. Two regression tests cover this arithmetic boundary and the actual frozen production corpus.
- Refreshing a guided step previously discarded its back history. Matching saved step/history now survive refresh and resume.
- Direct navigation between guided ratchet URLs previously retained the previous ratchet's question. Each ratchet now receives its own React state instance.
- The missing favicon produced a browser console 404. A self-contained SVG favicon removes that request.
- Two-hop graph columns previously overlapped adjacent clickable boxes. Column spacing now separates them without changing graph topology or traversal.
- The automated build receipt no longer labels the current verification as a prior slice or claims that implemented Operator/Replay features are absent. Browser evidence remains separately recorded.

## Verification

The release receipt records the actual command results, fingerprints, exact changed files, and browser reports. The final automated suite contains **139 tests**. The compiled production graph contains **249 nodes and 137 edges**, including **41 claims, 19 ratchets, 68 locks, 19 receipts, and four sources**. Three generated diagnostic candidates remain machine proposals.

Real Chrome sessions exercise the rendered app, including the six requested guided walkthroughs, yes/no/tangent branches, reset/back, saved progress, copied permalinks, technical mode, source context, support/impact panels, claim and provenance navigation, graph exploration, diagnostics, search, Operator commitments/callbacks/tangents/export/import, and Replay scrubbing. Screenshots and machine-readable reports are under `release-evidence/`. These are agent-driven browser checks with visual screenshot inspection, not a claim that a human performed a separate manual acceptance session.

Production is served under the strict local prefix `/rc-preview/`; paths outside it return 404. Relative Vite assets, data, preserved evidence, hash routes, and reloads are checked there. Desktop and mobile layouts are inspected. This demonstrates local repository-subpath readiness. **GitHub Actions and an actual GitHub Pages deployment were not executed.** The existing workflow uploads `dist`, uses Node 24, and needs no guessed repository name or custom domain.

## Integrity and limits

Canonical `vault/` and preserved evidence are compared byte-for-byte with the supplied ZIP. Generated `dist-data` artifacts match `public/data` and the production `dist/data` copies. Ratchets are represented by graph nodes and topology records; this compiler does not produce a separate `ratchets.json`.

All four source hashes are verified. Seventeen text receipts match their recorded source lines. Two image receipts have structurally valid locators; their content is not automatically verified by the compiler. Software tests do not establish the scientific truth of the corpus or authenticate a human reviewer.

The local npm installation warned that the esbuild postinstall script was not approved. The installed binary nevertheless executed successfully in the recorded Vite builds; no blanket script approval or dependency change was made. The app's desktop automation integrations were unavailable on this host, so browser checks used bundled Playwright with installed Chrome and fresh isolated profiles.

## Run and reproduce

```sh
npm ci
npm run verify
npm run dev
```

To inspect the production subpath:

```sh
node scripts/serve-subpath.cjs
```

Open `http://127.0.0.1:4173/rc-preview/`. This is a local verification server, not a production service. For the included browser regression driver, provide an installed Playwright module and Chrome executable through `PLAYWRIGHT_MODULE` and `CHROME_PATH`, then run:

```sh
node scripts/browser-smoke.cjs http://127.0.0.1:4173/rc-preview/ production
```

Playwright is an external verification tool; it is not a required runtime dependency of the site. The ZIP includes source, fixtures, generated artifacts, production `dist`, release receipts, and browser evidence. It excludes installed dependencies and scratch files.
