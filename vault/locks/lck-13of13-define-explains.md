---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- medical
- model-strength
summary: 'Interrogation lock: Define "explains 13 of 13".'
id: lck-13of13-define-explains
type: lock
title: Define "explains 13 of 13"
question: When you say the shaped-charge hypothesis explains 13 of 13 findings from first principles, do you mean consistent
  with them, predicted them, discriminates for shaped charge over alternatives, or uniquely identifies shaped charge?
targets:
- clm-shaped-charge-13-of-13
receipts:
- rec-shaped-charge-13-of-13
- rec-medical-limits
burdens:
- bur-13of13-definition
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-13of13-prediction
  'no': lck-13of13-consistency
  qualify: lck-13of13-discrimination
  unknown: lck-13of13-discrimination
  withdraw: lck-13of13-consistency
  non_answer: lck-13of13-define-explains
  tangent: lck-13of13-define-explains
---

Interrogation lock: Define "explains 13 of 13".
