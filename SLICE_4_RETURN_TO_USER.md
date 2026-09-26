# Slice 4 — Operator / Live Interrogation Runtime

Implemented directly on the Slice 3 public UI repository.

## Implemented

- Local event-sourced session runtime (`interrogation.session.v1`)
- Browser-local persistence with a local SessionStateAdapter and cross-tab BroadcastChannel updates
- Active Ratchet and active Lock control
- Answer classification: YES / NO / QUALIFY / UNKNOWN / WITHDRAW / NON-ANSWER / TANGENT
- Exact answer/transcript excerpt capture per response
- Automatic branch traversal for non-tangent answers
- Tangent classification does not advance the active proof obligation
- Commitment ledger reconstructed from events
- Open burden ledger with explicit open/close events
- Dynamic callback surfacing when new accepted/qualified commitments meet authored `contradicts`, `inconsistent_with`, or `tension_with` edges
- Static cross-ratchet callbacks from compiled topology
- Tangent parking lot with optional linked Ratchet
- Operator notes
- Lock and Ratchet closure events
- Session end event
- Deterministic event IDs within a session and monotonic sequence validation
- JSON session export/import
- Replay UI with event scrubber and exact historical reconstruction
- Session build/schema/content fingerprint pins; optional `VITE_GIT_COMMIT` injection
- Build mismatch warning when replaying against a different graph build
- Public graph remains immutable; operator state is a separate local runtime layer

## Routes

- `#/operator` — operator console
- `#/replay` — event-stream replay

## Environment smoke test

```bash
npm ci
npm run build
npm run dev
```

The runtime itself requires no backend. A realtime adapter can be added later without changing session event semantics.
