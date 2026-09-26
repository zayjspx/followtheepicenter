# Dependency Blast Radius and Baseline Interrogation Order

This layer is generated from the reviewed graph. It does not assign truth, credibility, or a debate winner.

`dist-data/dependency-blast-radius.json` answers: if a node is withdrawn, revised, or loses support, which downstream claims, burdens, diagnostics, or ratchets structurally depend on it?

`dist-data/topology.json` exposes direct and inherited burdens, response-pattern handling, ratchet triggers, and cross-ratchet callbacks.

`dist-data/interrogation-order.json` gives a deterministic baseline order for ratchets. The ordering uses only structural quantities: downstream claim reach, verified diagnostic adjacency, trigger breadth, and convergence burden count. A live session may enter at any ratchet and the runtime commitment ledger remains authoritative.

## Important semantics

- A node in another node's blast radius is **not** thereby false if the upstream node changes.
- A burden is not a contradiction.
- Loss of one support route can produce reduced support while other routes remain.
- Inherited burdens are surfaced so downstream claims cannot appear cleaner than their dependencies.
- New rescue assumptions add graph structure; no numerical penalty is assigned.
