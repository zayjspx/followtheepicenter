---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- petn
summary: 'Interrogation lock: Reconcile acoustic classification with PETN.'
id: lck-rode-petn-reconcile
type: lock
title: Reconcile acoustic classification with PETN
question: How does the slow-rise "not a shockwave" diagnostic classification map to the 0.5 g PETN shaped-charge detonation
  model?
targets:
- clm-rode-event-not-shockwave
- clm-petn-shaped-charge-hidden
receipts:
- rec-rode-acoustic-classification
- rec-bray-petn-05g
burdens:
- bur-rode-petn-acoustic-consistency
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-rode-petn-smear
  'no': lck-rode-petn-scope
  qualify: lck-rode-petn-smear
  unknown: lck-rode-petn-reconcile
  withdraw: lck-rode-petn-reconcile
  non_answer: lck-rode-petn-reconcile
  tangent: lck-rode-petn-reconcile
---

Interrogation lock: Reconcile acoustic classification with PETN.
