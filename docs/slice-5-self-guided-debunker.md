# Slice 5 — Self-Guided Debunker

## Product decision

The permanent self-guided site is the primary public product. Synchronized live-audience/viewer state is deferred indefinitely because the same canonical site can be used before, during, and after a debate without adding realtime UX, authentication, or state infrastructure.

The local Slice 4 operator runtime is preserved as an optional personal tool. It is not required for ordinary visitors and is no longer part of primary navigation.

## Core rule

**Author the reasoning once. Project it many ways.**

The Guided, Explore, Technical, Operator, and Replay surfaces all read the same compiled graph and Ratchet definitions. The guided experience does not duplicate case content.

## Public guided contract

A guided walkthrough:

1. identifies the attributed claim(s) targeted by the active Lock;
2. shows the exact authored question;
3. explains the currently open burden using the canonical burden node;
4. exposes source receipts attached to that Lock;
5. permits all seven authored response classes;
6. previews the structural consequence of the chosen response;
7. shows existing support paths that survive in the canonical graph;
8. shows structurally downstream claims without declaring them false;
9. advances only along the authored Ratchet branch;
10. leaves the canonical graph unchanged.

Response exploration is hypothetical. It does not assert what the user believes and does not record a public commitment.

## Browser-local state

Per-Ratchet guided state stores only:

- current Lock;
- branch trail;
- simple/technical preference.

Storage key prefix: `debunker.guided.v1:`.

No backend is required. Clearing/resetting a walkthrough removes only local state.

## Permalinks

`#/guided/<ratchet-id>?lock=<lock-id>` points to a stable authored step. The branch history is intentionally not encoded into the canonical URL; the current Lock is enough to share the relevant question and record.

## Simple vs technical

Simple mode exposes claim, question, burden, receipts, branch choices, structural consequence, surviving support, and reviewed diagnostics.

Technical mode additionally exposes IDs, full burden stack, cross-Ratchet callbacks, direct claim records, and dependency graph links.

## Non-goals

- no live synchronized audience state;
- no public vote or crowd verdict;
- no truth/credibility score;
- no mutation of canonical graph from guided interactions;
- no automatic claim falsification when a support path weakens;
- no separate handwritten "debunk article" corpus.
