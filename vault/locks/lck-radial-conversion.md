---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
- calibration
summary: 'Interrogation lock: Pressure conversion.'
id: lck-radial-conversion
type: lock
title: Pressure conversion
question: What conversion maps the reported image-motion vectors into pressure units?
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
  'no': lck-radial-conversion
  qualify: lck-radial-conversion
  unknown: lck-radial-conversion
  withdraw: lck-radial-conversion
  non_answer: lck-radial-conversion
  tangent: lck-radial-conversion
---

Interrogation lock: Pressure conversion.
