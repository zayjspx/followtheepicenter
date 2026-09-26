# Slice 2 contracts and limits

## Approved schema hardening

- Receipt quote is required for lines, page, paragraph and tweet locators, and optional for frame, timestamp and image_region. Context remains mandatory. Non-text locator content is structurally checked, not independently inspected.
- Assumptions permit exactly one form: numeric quantity/value/unit or propositional statement. Mixed/incomplete forms fail. Propositional assumptions cannot be evaluated as numeric derivation inputs.
- Claim epistemic_state accepts exactly: documented, observed, measured, calculated, supported_inference, hypothesis, disputed, unresolved, withdrawn, superseded, corrected.
- Source author and original_url may explicitly be null; the keys remain required.
- Session records require git_commit (full 40- or 64-hex hash), positive graph_schema_version, and 64-hex build_id. The old graph_build field is rejected. No session runtime or pin resolution is implemented.

The diagnostic-specific status enum, edg- identity prefix, full envelopes, immutable source hashes, strict reference resolution, and invariant applicability fields from Slice 1 remain.

## Typed audit annotations

Optional audit.yaml is canonical alongside a vault's Markdown nodes. Its envelope is schema_version: 1 and records. Each record requires a stable aud- ID, review_state, and a supported kind. Duplicate IDs, unknown fields/kinds/operators, invalid references and malformed values fail rather than being guessed.

Only reviewed annotations enter graph.audit. Reviewed annotations may not reference excluded records. Annotations do not add implicit proof edges or replace node/edge records.

Kinds:

| Kind | Required typed content |
|---|---|
| comparison | claim, left/right numeric node IDs, operator, output comparison unit, tolerance |
| independence | claim and distinct first-class support/prediction edge IDs targeting it |
| independent_support | edge explicitly represented as independently measured support |
| physical_quantity | output node, entity, quantity, scope, unit |
| calibration | method, raw input, converted output, entity, scope, input/output units, positive affine scale and finite offset |
| typed_value | claim, entity, quantity, scope, numeric value, unit, tolerance |

Annotations describe assertions, not truths. Human authors must ensure the metadata accurately represents a source. The engine does not use prose to infer or verify that correspondence.

## Exactly six detectors

### Arithmetic contradiction

Reads comparison metadata and compiled measurement/assumption/derivation values. Converts both operands into the stated compatible unit and evaluates the operator. No keywords are inspected.

Tolerance semantics: eq means absolute difference at most tolerance; ne means greater than tolerance; gt/lt require exceeding the tolerance margin; gte/lte permit that margin. A failed asserted relation yields a candidate attached to the comparison claim and operands. Unsupported units/operators or nonnumeric operands fail closed.

### Circular support

For an active reviewed support or predicted_by edge, remove that corroboration edge from traversal and look for an existing dependency path from evidence back to the supported target. If found, append the closing corroboration step. This exposes the entire cycle, including field references such as inputs.frequency and observed_from.

This is support-cycle detection, not rejection of all semantic graph cycles. Numerical input cycles are still rejected by the compiler before auditing. Consistent_with is not treated as corroboration.

### Pseudo-independence

Requires an explicit reviewed independence group. Traces the support paths to shared source-node roots and emits a candidate when at least two asserted paths share one. Duplicate use of the same evidence through separate edges is visible. Method bibliographies, invariant references and edge-rationale citations are excluded from observation-root tracing.

Roots are source-node IDs. This slice does not identify perceptually identical media, reconcile aliases of the same source, or determine statistical independence. Source grouping/granularity must be authored accurately. A shared root raises a review candidate, not a statistical proof.

### Assumption laundering

Requires an explicit independent_support assertion. Walks the supported evidence's ancestry, including the evidence node itself, and exposes any assumption or derivation origins. Equal numbers without ancestry do not trigger it. Ordinary use of assumptions or calculations without claimed independence does not trigger it.

### Missing calibration

Requires a declared physical output. Traces upstream image/audio-domain measurements and checks for a reviewed, active, connected calibration with the correct raw input, entity, scope and compatible output dimensions. The converted output must be distinct from the raw input and lie on the target's dependency chain; its method must also be connected. Declared numeric outputs must agree dimensionally with their node units.

The current calibration contract is a scoped affine mapping (positive scale, finite offset). Accepted raw units: px, px/frame, px/s, frame, rgb, digital_amplitude, sample. Unsupported reachable measurement units fail closed. A physical-domain input does not require image calibration. Unrelated scope/entity/units or a withdrawn/unreviewed calibration do not suppress a candidate.

Validity here means a structurally connected reviewed calibration declaration. It does not prove that its scale, coplanarity, camera model, audio processing, or other physical assumptions are correct. Those remain matters for source-backed review. Arbitrary nonlinear calibration models are not implemented.

### Active claim conflict

Operates on reviewed active claims. A reviewed active contradicts edge creates a candidate. Alternatively, typed values must share the exact entity, quantity and scope; after unit conversion, disjoint tolerance intervals create a candidate. Different entities/scopes/quantities and overlapping intervals do not. Explicit and typed triggers for the same pair are combined.

No contradiction is inferred from prose. Tension_with and inconsistent_with are not silently upgraded to contradicts.

## Paths, IDs and fingerprints

Each candidate contains:
- stable candidate ID derived from detector and trigger identity;
- detector and frozen diagnostic_type;
- candidate/machine_proposed states;
- triggering node, edge and annotation IDs;
- dependency paths with exact field, edge or annotation steps;
- explanation and typed numerical/structural evidence;
- fingerprint covering the candidate, triggering records and annotations.

Paths usually point upstream. A contradiction path follows the explicit semantic edge; typed-value conflicts include a singleton path for each claim and the shared quantity evidence. Those are not invented causal dependencies. Circular-support paths explicitly close.

Changing a relevant value preserves the trigger's candidate ID but changes its fingerprint. Every diagnostics artifact also binds to the entire graph fingerprint and build ID. Candidate records are sorted deterministically; authored-file enumeration order does not affect them.

Compiler and audit versions are slice-2-v1. Build identity includes authored node hashes and canonical audit annotations. The receipt independently hashes implementation files and generated fixture artifacts. Fingerprints detect accidental change; they are not signatures or reviewer authentication.

## Failure and publication boundaries

Detectors consume compiled graph/provenance only. Input schema versions, fingerprints, matching build identity, node/edge validity, derivation presence, typed annotations and explicit provenance links are checked before detectors run. Unsupported typed state throws. Artifacts are written only after compilation and all detector calls return.

Candidate output is not compatible with an authored reviewed diagnostic envelope. Its schema rejects verified or reviewed values. The tests separately demonstrate that a manually authored reviewed diagnostic may be published while regenerated machine candidates remain candidates.

The public reviewed graph is not modified by auditing. The empty production vault emits an empty diagnostics file. All seven nonempty examples are synthetic fixtures.

Source integrity limitations remain: local byte hashes and local line quotes are verified; remote hashes are declared, and non-line media locators receive structural checks only. Source versions preserve family/order constraints. Historical ID-reuse detection, source alias reconciliation, graph diff, session replay and runtime behavior remain outside Slice 2.
