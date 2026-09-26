---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- energy
- calibration
summary: 'Interrogation lock: Energy calibration chain.'
id: lck-optflow-energy-calibration
type: lock
title: Energy calibration chain
question: If physical energy is intended, show the chain from pixel displacement to physical velocity, moving mass or deformation
  work, and energy units.
targets:
- clm-optflow-energy-distribution
receipts:
- rec-radial-pressure
burdens:
- bur-optflow-energy-bridge
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-optflow-energy-calibration
  'no': lck-optflow-energy-calibration
  qualify: lck-optflow-energy-calibration
  unknown: lck-optflow-energy-calibration
  withdraw: lck-optflow-energy-calibration
  non_answer: lck-optflow-energy-calibration
  tangent: lck-optflow-energy-calibration
---

Interrogation lock: Energy calibration chain.
