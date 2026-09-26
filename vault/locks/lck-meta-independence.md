---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: When the site calls these lines independent, do you mean distinct underlying observations/data sources,
  or different analyses of some of the same source data?
id: lck-meta-independence
type: lock
title: Define evidence independence
question: When the site calls these lines independent, do you mean distinct underlying observations/data sources,
  or different analyses of some of the same source data?
targets:
- clm-pcb-four-independent-lines
- clm-pcb-six-independent-lines
- clm-synthesis-each-piece-independent
receipts:
- rec-pcb-four-independent-lines
- rec-pcb-six-independent-lines
- rec-synthesis-independent-pieces
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
  'no': lck-meta-independence-scope
  qualify: lck-meta-independence-roots
  unknown: lck-meta-independence-roots
  withdraw: lck-meta-independence
  non_answer: lck-meta-independence
  tangent: lck-meta-independence
---

When the site calls these lines independent, do you mean distinct underlying observations/data sources, or different analyses of some of the same source data?
