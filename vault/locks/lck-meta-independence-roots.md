---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Identify the distinct underlying provenance root for each line being counted as independent.
id: lck-meta-independence-roots
type: lock
title: Identify provenance roots
question: Identify the distinct underlying provenance root for each line being counted as independent.
targets:
- clm-pcb-four-independent-lines
- clm-pcb-six-independent-lines
receipts:
- rec-pcb-four-independent-lines
- rec-pcb-six-independent-lines
burdens:
- bur-evidence-independence-provenance
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-meta-independence-roots
  'no': lck-meta-independence-roots
  qualify: lck-meta-independence-roots
  unknown: lck-meta-independence-roots
  withdraw: lck-meta-independence-roots
  non_answer: lck-meta-independence-roots
  tangent: lck-meta-independence-roots
---

Identify the distinct underlying provenance root for each line being counted as independent.
