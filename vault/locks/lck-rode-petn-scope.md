---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- petn
summary: 'Interrogation lock: Scope or revise RØDE classification.'
id: lck-rode-petn-scope
type: lock
title: Scope or revise RØDE classification
question: Which claim should be revised if the current PETN model and the published "not a shockwave" classification are not
  both being retained?
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
  'yes': lck-rode-petn-scope
  'no': lck-rode-petn-scope
  qualify: lck-rode-petn-scope
  unknown: lck-rode-petn-scope
  withdraw: lck-rode-petn-scope
  non_answer: lck-rode-petn-scope
  tangent: lck-rode-petn-scope
---

Interrogation lock: Scope or revise RØDE classification.
