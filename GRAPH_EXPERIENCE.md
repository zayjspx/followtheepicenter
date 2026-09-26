# Graph-first experience — local review build

The home page and `#/graph` now open the interactive case network. The prior landing page remains at `#/about`; the old focused diagram is at `#/neighborhood`. Existing claim, receipt, Guided, Operator and Replay routes remain available.

## What you can do

- Inspect the actual nodes and authored relationships, with additional field references and provenance links distinguished from semantic edges. Select or drag nodes, inspect connections, search, filter layers, pan and zoom.
- Start any of the 19 authored ratchets. The ratchet view draws question nodes, answer branches, self-returns and convergence burdens. Taken branches are highlighted and the active question remains beside the graph.
- Record answers in a persistent local trail. Obligations, including inherited burdens, carry forward. Revisiting a question with a changed answer surfaces the earlier response. Tangents leave the current question in place. Authored cross-ratchet callbacks remain available.
- Explicitly withhold and restore premises. Cumulative effects are recomputed through compiled dependencies, with a concrete path back to the withheld premise. The inspector separates affected and unaffected recorded support routes.
- Record a proposed explanation together with a new evidence obligation. Proposals do not automatically discharge existing obligations. A burden can be marked satisfied only as an explicit local assessment accompanied by a note.
- Undo, reset, reload, export and import the walk. Imported walks must match the graph build and pass structural validation.

## Exact meaning of the simulation

This is a browser-local structural what-if. It does not edit the canonical vault, add machine-verified findings, or publish user commitments.

The simulation recomputes dependency exposure and recorded support-route availability. It **does not infer a Boolean proof model** from a collection of edges: the current graph does not consistently encode which premises form a jointly required set versus sufficient alternatives. An unaffected support route is not necessarily independent, valid or sufficient; an affected conclusion is not automatically false. The display therefore says “needs review” rather than inventing a truth verdict.

Answer buttons follow authored question branches. A “No” to a question about a measurement is not silently reinterpreted as withdrawal of every targeted claim. Withholding is an explicit separate action. The existing Operator commitment-conflict logic remains in Operator; the network walk records question-level answers and flags changed answers to the same question.

The renderer is a two-dimensional interactive SVG network. This build does not claim a three-dimensional orbital view, natural-language interpretation of explanations, automatic review of new evidence, or a complete logical-consistency solver.

## Review and deployment

Run `npm run dev` for local review. Run `npm test` and `npm run build` for verification. `scripts/network-smoke.cjs` exercises the new network; `scripts/browser-smoke.cjs` exercises the retained classic surfaces. Both use an external Playwright installation specified with `PLAYWRIGHT_MODULE` and Chrome with `CHROME_PATH`.

`GRAPH_EXPERIENCE_RECEIPT.json` records this build's current results. RC1 receipts and screenshots are retained as historical evidence of the previously published release. This graph build was developed on the local `graph-ratchet` branch and has not been pushed to the public site.
