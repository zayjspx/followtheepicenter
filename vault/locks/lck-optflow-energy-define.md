---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- energy
summary: 'Interrogation lock: Define energy quantity.'
id: lck-optflow-energy-define
type: lock
title: Define energy quantity
question: What physical quantity and unit does "energy" denote in this heatmap?
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
  'no': lck-optflow-energy-scope
  qualify: lck-optflow-energy-calibration
  unknown: lck-optflow-energy-define
  withdraw: lck-optflow-energy-define
  non_answer: lck-optflow-energy-define
  tangent: lck-optflow-energy-define
---

Interrogation lock: Define energy quantity.
