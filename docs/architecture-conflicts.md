# Slice 2 architecture conflict report

**Unresolved conflicts: none.**

The five schema-hardening changes were explicitly authorized. Existing node and edge schemas were otherwise retained. No frozen node type, edge relation, epistemic distinction, provenance rule, or review gate was replaced.

Two representation questions required explicit handling:

1. **Detector names versus frozen diagnostic classes.** The work order names arithmetic_contradiction and active_claim_conflict as detectors; the frozen ontology names arithmetic_error and hard_contradiction as diagnostic classes. Generated records retain both: the requested name in detector and the frozen class in diagnostic_type. The other four names map directly.
2. **Typed assertions absent from Slice 1.** Numeric comparison operators, independence assertions, scoped physical outputs/calibrations, and comparable claim values cannot be recovered deterministically from prose. They are represented in a separate strict audit.yaml annotation schema referencing existing node/edge IDs. The compiler resolves IDs, validates review state, includes annotations in build identity, and projects them into graph.audit. This adds compiler data without adding epistemic nodes, changing existing node schemas beyond the approved patch, or inventing edge semantics.

Provenance now also emits explicit field/edge steps alongside the existing ancestry tables. Dependency orientation is unchanged from Slice 1. Graph/provenance transport schema version is 2; audit annotations and candidate output schema version are 1.

There is no automatic authority escalation. Candidates do not enter graph.nodes or become verified. An authored human review record remains necessary for verification. The software does not authenticate who authored review_state: reviewed.

No implementation pressure required a forbidden redesign. Slice 3 and all excluded runtime/corpus work remain unimplemented.
