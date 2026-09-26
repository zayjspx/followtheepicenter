Next phase is **not UI yet**. It is the **Implementation Contract**: turn the frozen architecture into schemas, compiler rules, repo boundaries, and executable acceptance tests so Codex cannot quietly redesign the system while building it.

# Phase 2 — Implementation Contract

## 1. Freeze the technical stack

For v1:

- **React + TypeScript + Vite**
- **GitHub Pages**
- **Markdown + YAML frontmatter** as canonical authored data
- **Zod** for schema validation
- **YAML parser** for vault ingestion
- **Cytoscape.js** for the global semantic graph
- normal React components for Ratchets / Live / Timeline / Evidence
- **MiniSearch** or equivalent static client-side search
- Node/TypeScript build scripts
- Vitest for deterministic tests
- no database
- no required runtime AI
- no backend for core functionality
- no realtime provider in first implementation slice

Generated artifacts:

```text
dist-data/
  graph.json
  provenance.json
  diagnostics.json
  ratchets.json
  timeline.json
  search-index.json
  build-manifest.json
```

Canonical truth remains `/vault`, never those generated files.

---

# 2. Canonical node envelope

Every authored node uses the same minimum envelope:

```yaml
id: clm-example
type: claim
title: Short human-readable title

status: active
review_state: reviewed

created_at: 2026-09-26
updated_at: 2026-09-26

tags:
  - acoustics
  - itd

summary: >
  Atomic proposition represented by this node.
```

Allowed `review_state`:

```text
machine_proposed
needs_review
reviewed
rejected
```

Allowed generic lifecycle:

```text
active
superseded
withdrawn
corrected
archived
```

Type-specific fields extend this envelope.

---

# 3. Canonical source schema

```yaml
id: src-epicenter-main-20260925
type: source
source_type: webpage

title: EPICENTER — Forensic Analysis
author: Jon Bray

original_url: https://...
published_at:
captured_at: 2026-09-25T00:00:00Z

sha256: "..."
artifact: public/evidence/...

redistribution: full_local

version:
  family: epicenter-main
  sequence: 4
  supersedes: src-epicenter-main-20260701
```

`redistribution` enum:

```text
full_local
excerpt_only
metadata_only
external_artifact
```

---

# 4. Receipt schema

```yaml
id: rec-itd-smoking-gun
type: receipt

source: src-epicenter-main-20260925

locator:
  kind: lines
  start: 973
  end: 1007

quote: >
  ITD of -113.4µs ... Only possible from a near-field source.

context: >
  Section discussing stereo ITD source localization.
```

Other locator kinds:

```text
tweet
timestamp
frame
page
paragraph
image_region
lines
```

---

# 5. Observation / measurement separation

Observation:

```yaml
id: obs-itd-reported
type: observation

statement: >
  The published analysis reports an inter-channel delay.

receipts:
  - rec-itd-smoking-gun
```

Measurement:

```yaml
id: mea-itd-view13
type: measurement

quantity: interchannel_time_delay
value: -113.4
unit: us

method: met-stereo-itd
observed_from:
  - obs-itd-reported
```

Never merge these two.

---

# 6. Assumption schema

```yaml
id: asm-phone-baseline-39mm
type: assumption

quantity: stereo_microphone_baseline
value: 0.039
unit: m

basis: claimant_stated
receipts:
  - rec-itd-smoking-gun
```

`basis`:

```text
claimant_stated
literature
estimated
typical_value
operator_supplied
derived_elsewhere
unknown
```

---

# 7. Invariant schema

```yaml
id: inv-plane-wave-itd
type: invariant

statement: >
  For a two-sensor baseline d receiving a plane wave at propagation
  speed c, absolute TDOA cannot exceed d/c.

formula: abs_dt_max = d / c

applies_when:
  - two_sensor_delay
  - approximately_plane_wave

does_not_apply_when:
  - unknown_sensor_processing_invalidates_raw_delay
  - channels_not_time_coherent

references:
  - src-acoustics-reference
```

The applicability fields are mandatory.

---

# 8. Derivation schema

```yaml
id: der-itd-max
type: derivation

expression: baseline / sound_speed

inputs:
  baseline:
    node: asm-phone-baseline-39mm
  sound_speed:
    value: 343
    unit: m/s

output:
  quantity: max_plane_wave_itd
  unit: us

expected:
  value: 113.70
  tolerance: 0.05
```

The compiler executes it.

The stored `expected` value is a **test oracle**, not canonical arithmetic.

If evaluation differs outside tolerance, the build fails.

---

# 9. Claim schema

```yaml
id: clm-itd-nearfield-only
type: claim

statement: >
  The -113.4 us ITD is only possible from a near-field source.

asserted_by: jon-bray

receipts:
  - rec-itd-smoking-gun

theory_models:
  - thy-current

epistemic_state: documented
```

`epistemic_state` is about what *our node represents*, not whether the proposition is true.

---

# 10. Burden schema

```yaml
id: bur-itd-nearfield-exclusivity
type: burden

statement: >
  Demonstrate why the reported ITD cannot arise from an applicable
  far-field geometry.

opened_by:
  - clm-itd-nearfield-only

closure_requires:
  all:
    - sensor_geometry
    - phone_orientation
    - propagation_model
```

---

# 11. Diagnostic schema

```yaml
id: dgn-itd-nearfield-conflict
type: diagnostic
diagnostic_type: invariant_conflict

status: verified

targets:
  - clm-itd-nearfield-only

depends_on:
  - der-itd-max
  - inv-plane-wave-itd

statement: >
  The reported delay is approximately equal to the baseline-limited
  plane-wave maximum, so near-field exclusivity requires additional
  justification.

severity: load_bearing
```

Severity is structural only:

```text
local
significant
load_bearing
```

Not a truth score.

---

# 12. First-class edge schema

Edges live separately:

```yaml
id: edg-000001
type: edge

from: mea-itd-view13
relation: inconsistent_with
to: clm-itd-nearfield-only

rationale: >
  The measurement is approximately the theoretical baseline maximum
  under the cited plane-wave invariant.

review_state: reviewed

depends_on:
  - der-itd-max
```

This is essential because an opponent must be able to challenge the **relationship itself**.

---

# 13. Lock schema

```yaml
id: lck-itd-standby
type: lock

title: Stand by near-field exclusivity

question: >
  Do you still stand by the claim that -113.4 us is only possible
  from a near-field source?

targets:
  - clm-itd-nearfield-only

receipts:
  - rec-itd-smoking-gun

burdens:
  - bur-itd-nearfield-exclusivity

branches:
  yes: lck-itd-baseline
  no: lck-itd-withdraw
  qualify: lck-itd-define
  unknown: lck-itd-burden
  withdraw: lck-itd-close-withdrawn
  non_answer: lck-itd-repeat
  tangent: lck-itd-repeat
```

---

# 14. Ratchet schema

```yaml
id: rat-itd-nearfield
type: ratchet

title: ITD Near-Field Ratchet

entry_lock: lck-itd-standby

locks:
  - lck-itd-standby
  - lck-itd-baseline
  - lck-itd-withdraw
  - lck-itd-define
  - lck-itd-burden
  - lck-itd-repeat

convergence_burdens:
  - bur-itd-nearfield-exclusivity

closure_states:
  - burden_satisfied
  - claim_withdrawn
  - claim_qualified
  - unresolved
```

Compiler verifies every branch is reachable and valid.

---

# 15. Session event schema

Never store only current state.

Store events:

```yaml
event_id: evt-000184
session: ses-bray-001
sequence: 184
timestamp: 00:47:09

event_type: commitment_added

payload:
  claim: clm-radial-pressure
  speaker: jon-bray
  commitment: accepted
  receipt: rec-session-0047-09
```

State is replayed from events.

---

# 16. Public graph versus authored vault

Codex must not let React components read arbitrary Markdown files directly.

Pipeline:

```text
VAULT
  ↓
SCHEMA VALIDATION
  ↓
SEMANTIC COMPILER
  ↓
AUDIT ENGINE
  ↓
STATIC JSON
  ↓
WEB APP
```

One-directional.

UI cannot mutate canonical evidence.

---

# 17. Initial deterministic detectors

Do **not** build twenty half-working heuristics.

v1 starts with six high-confidence detectors:

### Detector 1 — arithmetic contradiction

Numeric relation asserted in text conflicts with stored measurements.

Gold case:

```text
0.567 "exceeds" 0.718
```

### Detector 2 — circular support

A node presented as support transitively depends on the proposition/evidence it supposedly confirms.

Gold case:

```text
4940 Hz
→ 188 m/s
→ "predicts" 4940 Hz
```

### Detector 3 — shared provenance

Multiple allegedly independent support paths converge on the same source root.

Gold case:

```text
CLAHE
optical flow
false color
→ same frames
```

### Detector 4 — assumption laundering

Assumed/derived value later enters a chain as independent measurement.

### Detector 5 — missing calibration

A physical-unit result depends directly on image/audio-domain quantity without an allowed calibration chain.

### Detector 6 — active claim conflict

Two reviewed active claims have explicit contradiction edges or incompatible typed values.

Anything more sophisticated can wait.

---

# 18. Gold fixtures before Bray corpus

Codex must build a tiny fixture corpus first.

```text
/fixtures
  /itd
  /4940
  /pcb-color
  /pcb-size
  /pseudo-independent
  /session-callback
```

Each fixture should contain the smallest possible graph needed to prove one architectural capability.

If the fixtures don't work, **do not ingest the giant Bray corpus**.

---

# 19. Implementation slices

## Slice 0 — Repository bootstrap

Deliver:

```text
React/Vite/TS
vault folders
schemas
fixture folders
tests
GitHub Actions
GitHub Pages workflow
```

No real UI except a build-success page.

---

## Slice 1 — Semantic compiler

Deliver:

```text
parse Markdown/YAML
validate nodes
validate edges
resolve IDs
execute derivations
compile graph.json
```

Acceptance:

ITD fixture evaluates to ~113.70 us.

---

## Slice 2 — Audit engine

Implement the six frozen detectors.

Acceptance:

4940 fixture emits circular-support candidate.

PCB color fixture emits arithmetic diagnostic.

Pseudo-independent fixture identifies common provenance root.

---

## Slice 3 — Graph explorer

Read-only public UI.

Must support:

- search
- node details
- upstream WHY
- downstream DEPENDS ON THIS
- receipts
- diagnostics
- permalink

No fancy animation requirement.

---

## Slice 4 — Ratchet compiler + viewer

Render locks and branches.

Must show:

- active proposition
- question
- yes/no/qualify/etc paths
- convergence burden
- receipts

---

## Slice 5 — Local interrogation runtime

No backend.

Browser/local file or localStorage session.

Must support:

- choose response branch
- commitment ledger
- callbacks
- parking lot
- active Lock persistence
- immutable event stream
- export session JSON

---

## Slice 6 — Session replay

Import exported session JSON.

Replay event by event.

Pin session to graph/build version.

---

## Slice 7 — Theory versioning + semantic diff

Show:

```text
added claim
removed claim
changed edge
superseded claim
```

---

## Slice 8 — Bray corpus ingestion

Only now populate the real vault.

Start with our strongest families:

```text
ITD
4940 Hz
PCB dimensions
PCB color
radial pressure / MagClip
optical flow → pressure
SUV glass
```

Not the whole site at once.

---

# 20. First real ratchets to ship

v1 should ship at least these six:

```text
rat-itd-nearfield
rat-4940-circularity
rat-pcb-dimensions
rat-pcb-color
rat-radial-component-response
rat-optical-flow-pressure
```

SUV trace evidence can be seventh.

---

# 21. Definition of "done" for v1

A listener can open the GitHub Pages site and:

1. click a Bray claim,
2. see the exact receipt,
3. inspect what supports it,
4. trace assumptions and derivations backward,
5. trace downstream dependencies forward,
6. see reviewed diagnostics,
7. open the associated ratchet,
8. understand both YES and NO branches,
9. watch a recorded interrogation session traverse it,
10. independently challenge a node or edge through GitHub.

An operator can:

1. activate a Lock,
2. classify an answer,
3. traverse the selected branch,
4. park tangents,
5. record commitments,
6. receive callbacks,
7. export the session,
8. publish a replay.

And the site builds entirely from the reviewed vault.

---

# 22. Tier-0 boundary for Codex

Codex may decide:

- component organization
- CSS approach
- internal helper functions
- testing implementation
- Cytoscape layout choice
- build-script decomposition
- accessibility implementation
- minor schema ergonomics that preserve semantics

Codex may **not** decide:

- new epistemic node types replacing frozen ones
- changing observation/inference separation
- removing first-class edges
- turning diagnostics into truth scores
- replacing ratchets with ordinary decision trees
- dropping convergence burdens
- dropping provenance ancestry
- treating generated JSON as canonical
- making AI judgments authoritative
- introducing required backend state
- merging public and private operator data
- silently "simplifying" the commitment/session model

If implementation pressure appears to require one of those changes: **STOP and return an architecture conflict report.**

---

# 23. First Codex work order

The first handoff should be deliberately small:

> **Implement Slice 0 + Slice 1 only.**
>
> Bootstrap the repository, canonical vault schemas, six fixture directories, semantic parser/validator, derivation evaluator, graph compiler, tests, and GitHub Pages CI skeleton.
>
> Demonstrate the ITD fixture compiling from authored Markdown/YAML to generated graph JSON and evaluating `0.039 m / 343 m/s` to approximately `113.70 us`.
>
> Do not implement graph visualization, ratchet UI, live sessions, AI features, or the Bray corpus yet.
>
> Return:
> - repository tree
> - schema files
> - compiler
> - tests
> - generated fixture graph
> - build receipt
> - architecture conflicts, if any
>
> **Stop after Slice 1 passes.**

That is the next execution boundary.

Once Slice 1 comes back, **we review the organism before permitting Slice 2**.
