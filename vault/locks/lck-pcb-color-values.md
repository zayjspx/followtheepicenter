---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- color
summary: 'Interrogation lock: Stand by B/R values.'
id: lck-pcb-color-values
type: lock
title: Stand by B/R values
question: Do you stand by object B/R 0.567, skin 0.546, and shirt 0.718?
targets:
- clm-pcb-object-exceeds-shirt-br
receipts:
- rec-pcb-color-values
burdens:
- bur-pcb-color-arithmetic
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-pcb-color-arithmetic
  'no': lck-pcb-color-correct
  qualify: lck-pcb-color-define
  unknown: lck-pcb-color-define
  withdraw: lck-pcb-color-correct
  non_answer: lck-pcb-color-values
  tangent: lck-pcb-color-values
---

Interrogation lock: Stand by B/R values.
