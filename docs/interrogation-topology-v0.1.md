# Interrogation Topology v0.1 — Applied Doctrine

Status: IMPLEMENTED CONTENT LAYER

This document materializes the first pseudo-pass that preceded Bray Core Corpus v0.1. The canonical machine-readable records live in `vault/`.

## Three ratchet classes

- **Domain ratchet** — tests a particular physical/evidentiary claim.
- **Bridge ratchet** — tests the inference connecting domains.
- **Meta ratchet** — tests provenance, evidentiary strength, theory mutation, or model scope.

## Runtime laws

1. A response creates or modifies commitments; it does not rewrite source truth.
2. A rescue mechanism becomes graph structure and opens its own burden.
3. Multiple mechanisms are allowed, but `all_of_the_above` opens an assignment burden.
4. A legitimate missing branch is added; `false_dichotomy` is not treated as automatic evasion.
5. Tangents are preserved as future entry points and do not advance the active burden.
6. Evidence transformations do not become independent observations without distinct provenance roots.
7. Claims may partially collapse without becoming false. Support-path loss is separate from claim truth.

## Collapse states

Generated topology analysis uses these structural states:

- `supported` — at least one active support/dependency route remains and no required burden is structurally unresolved in the static graph.
- `burdened` — one or more direct or inherited burdens remain.
- `reduced_support` — some support routes can be removed while others remain.
- `scope_collapse` — represented at runtime when a stronger claim is qualified into a narrower one.
- `model_fork` — represented by theory/version records when a rescue changes the causal model.

These are structural descriptors, not truth scores.

## Burden inheritance

If claim B depends on claim A and A requires an unresolved burden, B exposes that burden as inherited. This is compiled into `topology.json`; the canonical authored edges remain explicit in `vault/edges/`.

## Rescue cost

No scalar penalty is assigned. The machine records the structural consequence only: an auxiliary premise adds dependency nodes and, when unresolved, additional burdens.

## Universal lock grammar

- STANDBY — Do you still stand by X?
- DEFINE — What exactly does X mean?
- SOURCE — Where does X come from?
- INDEPENDENCE — Was X obtained independently of Y?
- CALIBRATION — What converts A into physical quantity B?
- ATTRIBUTION — What identifies this source rather than the broader class?
- TIMING — Did A occur before or after B?
- ASSIGNMENT — Which mechanism causes which observation?
- ALTERNATIVE — What discriminates this from Y?
- FALSIFIER — What result would count against this claim?
- CLOSURE — What evidence satisfies the burden?

## Added production topology

This pass adds: current-theory lock, evidentiary-strength meta ratchet, independence meta ratchet, theory-evolution ratchet, device-output taxonomy, component differential-response ratchet, energy/impulse bookkeeping, blood time-zero ratchet, blood detectability ratchet, and the full response-pattern library.
