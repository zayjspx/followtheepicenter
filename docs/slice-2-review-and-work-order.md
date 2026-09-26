I inspected the Slice 1 bundle against the frozen architecture and the implementation contract.

**Slice 1 passes. Slice 2 is authorized — with one small schema-hardening gate first.**

The important stuff is there and clean: strict Markdown/YAML ingestion, first-class edges, typed references, observation/measurement separation, safe dimensional arithmetic with no `eval`, recursive derivations, source hashing, line-receipt verification, provenance ancestry, descendants/dependency blast-radius groundwork, reviewed-only publishing, deterministic output, synthetic ITD fixture, GitHub CI/Pages skeleton, and explicit scope boundaries. The generated fixture computes `113.70262390670555 us`, and I independently verified that the graph file SHA-256 matches the supplied build receipt.

I also checked that Codex **did not cheat the architecture**: no truth scores, no backend, no AI authority, no real Bray claims smuggled into the synthetic fixture, no UI prematurely substituting for the compiler, and no flattening of assumptions/measurements/inferences.

One limitation on my review: my environment couldn't complete the npm dependency install, so I couldn't independently rerun Vitest here. I did inspect the 35-test suite and compiler implementation directly, and the supplied local receipt records test/build exit code 0. This is an environment limitation on my side, not evidence of a repo failure.

Before we let the audit engine crystallize around these schemas, I want five foundation tweaks. These are **architecture corrections, not redesigns**, and several arise because our Phase-2 shorthand schema was narrower than the full frozen doctrine:

1. **Receipts must support non-text evidence.** `quote` cannot be mandatory for frame/image/timestamp receipts. Make it required for textual locators and optional for visual/audio locators; `context` remains required.
2. **Assumptions need a propositional form.** Right now assumptions are numeric only. We need to represent things like `F68 = moment of vascular breach` or `object and scale reference are coplanar` without misclassifying them as claims. Support either a numeric `{quantity,value,unit}` assumption or a `statement` assumption. Numeric derivations must still reject propositional assumptions as arithmetic inputs.
3. **Restore the frozen epistemic-state vocabulary.** `claim.epistemic_state` is currently hard-coded to `documented`. Implement the frozen states: `documented`, `observed`, `measured`, `calculated`, `supported_inference`, `hypothesis`, `disputed`, `unresolved`, `withdrawn`, `superseded`, `corrected`.
4. **Don't force invented source metadata.** `author` and `original_url` should permit `null`. We will have screenshots, recovered media, and other artifacts where one or both genuinely aren't known.
5. **Session pins should match doctrine now, while no session data exists.** Replace/expand the generic `graph_build` field with `git_commit`, `graph_schema_version`, and `build_id`. Runtime behavior remains deferred.

After those five patches and tests, **Slice 2 is the audit engine**.

The Codex work order I'd issue is:

```text
INTERROGATION SYSTEM — WORK ORDER: SLICE 2
Authority: Frozen Architecture v1.0 + Phase 2 Implementation Contract
Prerequisite: Slice 1 accepted.

FIRST: perform the approved schema-hardening patch:
- non-text receipts may omit quote; textual receipts require it
- assumptions support numeric OR propositional forms
- restore frozen epistemic-state enum
- source author/original_url may be null
- session pin schema uses git_commit + graph_schema_version + build_id
Add regression tests. Do not otherwise redesign schemas.

THEN implement Slice 2: Deterministic Audit Engine.

Implement ONLY these six detectors:

1. arithmetic_contradiction
2. circular_support
3. pseudo_independence / shared provenance
4. assumption_laundering
5. missing_calibration
6. active_claim_conflict

Rules:
- detectors produce candidate diagnostics only
- machine output is never automatically "verified"
- diagnostics must identify the exact nodes/edges and reasoning path that triggered them
- detectors must operate on compiled graph/provenance, not raw prose guessing
- no LLM/API/runtime AI
- no Bray corpus yet
- no graph UI
- no ratchet runtime
- no session runtime
- no semantic-diff implementation yet

Complete the reserved fixtures:
fixtures/4940/
fixtures/pcb-color/
fixtures/pcb-size/
fixtures/pseudo-independent/

Add any minimal detector-specific fixture needed for:
assumption_laundering
missing_calibration
active_claim_conflict

GOLD ACCEPTANCE TESTS

A. 4940 circularity:
4940 Hz observation
→ used to derive ~188 m/s
→ 188 m/s later offered as support/prediction of 4940 Hz
=> candidate circular_support diagnostic
The emitted diagnostic must expose the complete dependency cycle.

B. PCB color arithmetic:
object B/R = 0.567
shirt B/R = 0.718
claim = "object exceeds shirt"
=> candidate arithmetic_contradiction
The detector must evaluate the relation, not keyword-match prose.

C. Pseudo-independence:
CLAHE / optical-flow / false-color analyses
all descend from the same source-frame root
and are grouped/asserted as independent support
=> candidate pseudo_independence with shared root shown.

D. Assumption laundering:
a value authored as assumption or derivation
later appears in an evidence chain as independent measurement/support
=> candidate assumption_laundering with ancestry shown.

E. Missing calibration:
image-domain measurement is used to support a physical-unit inference
without a valid calibration ancestry
=> candidate missing_calibration.

F. Active claim conflict:
two reviewed active claims connected by a reviewed contradiction relation,
or typed incompatible values for the same defined quantity/entity,
=> candidate active_claim_conflict.
Do not infer semantic contradiction from prose.

OUTPUTS
dist-data/diagnostics.json
plus any required additions to graph/provenance/build-manifest.

Every diagnostic must include:
- stable candidate ID
- diagnostic type
- triggering nodes/edges
- dependency path(s)
- human-readable explanation
- review_state: machine_proposed
- deterministic fingerprint

REQUIRED TESTS
- each gold case triggers exactly the intended detector
- near-miss/negative fixture does NOT trigger it
- deterministic output under shuffled authored-file order
- reviewed graph unchanged by merely running audits
- generated candidates cannot become verified without authored human review
- bad/unsupported detector state fails closed where appropriate

STOP CONDITIONS
Do not implement Slice 3.
Do not ingest Bray.
Do not add Cytoscape/MiniSearch.
Do not invent heuristic NLP contradiction detection.
Do not alter frozen ontology or edge semantics without an architecture-conflict report.

DELIVER
- updated repo
- detector source
- completed fixtures
- tests
- diagnostics JSON examples
- updated build receipt
- architecture conflict report, even if "none"
- zip

Stop after Slice 2 passes.
```

This is where the machine starts becoming **interesting**: Slice 1 proved we can compile epistemology; Slice 2 proves the graph can start finding structural problems by itself.