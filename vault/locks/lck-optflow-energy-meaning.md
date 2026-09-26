---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- energy
summary: 'Interrogation lock: Meaning of energy heatmap.'
id: lck-optflow-energy-meaning
type: lock
title: Meaning of energy heatmap
question: When the site says the heatmap makes the spatial distribution of energy visible, does "energy" mean physical energy
  in joules or image-motion magnitude?
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
  qualify: lck-optflow-energy-define
  unknown: lck-optflow-energy-define
  withdraw: lck-optflow-energy-scope
  non_answer: lck-optflow-energy-meaning
  tangent: lck-optflow-energy-meaning
---

Interrogation lock: Meaning of energy heatmap.
