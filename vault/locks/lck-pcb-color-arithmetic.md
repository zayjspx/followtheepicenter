---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- color
- arithmetic
summary: 'Interrogation lock: Resolve B/R arithmetic.'
id: lck-pcb-color-arithmetic
type: lock
title: Resolve B/R arithmetic
question: '0.567 is lower than 0.718, while the text says the object exceeds both skin and shirt. Which is wrong: the number,
  the comparison, or the metric being compared?'
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
  'no': lck-pcb-color-arithmetic
  qualify: lck-pcb-color-arithmetic
  unknown: lck-pcb-color-arithmetic
  withdraw: lck-pcb-color-arithmetic
  non_answer: lck-pcb-color-arithmetic
  tangent: lck-pcb-color-arithmetic
---

Interrogation lock: Resolve B/R arithmetic.
