---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
summary: 'Interrogation lock: Does optical flow measure pressure?.'
id: lck-radial-direct-measure
type: lock
title: Does optical flow measure pressure?
question: Does the optical-flow algorithm itself measure pressure?
targets:
- clm-optflow-pressure-signature
receipts:
- rec-radial-pressure
burdens:
- bur-optflow-pressure-bridge
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-radial-conversion
  'no': lck-radial-physical-model
  qualify: lck-radial-physical-model
  unknown: lck-radial-physical-model
  withdraw: lck-radial-scope
  non_answer: lck-radial-direct-measure
  tangent: lck-radial-direct-measure
---

Interrogation lock: Does optical flow measure pressure?.
