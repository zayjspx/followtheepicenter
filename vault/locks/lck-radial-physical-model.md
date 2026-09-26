---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
- calibration
summary: 'Interrogation lock: Physical bridge to pressure.'
id: lck-radial-physical-model
type: lock
title: Physical bridge to pressure
question: What additional calibrated physical model connects the observed image motion to the claimed pressure field?
targets:
- clm-radial-internal-pressure
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
  'yes': lck-radial-physical-model
  'no': lck-radial-physical-model
  qualify: lck-radial-physical-model
  unknown: lck-radial-physical-model
  withdraw: lck-radial-physical-model
  non_answer: lck-radial-physical-model
  tangent: lck-radial-physical-model
---

Interrogation lock: Physical bridge to pressure.
