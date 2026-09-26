---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
summary: 'Interrogation lock: Define radial evidence.'
id: lck-radial-define
type: lock
title: Define radial evidence
question: What exact physical proposition is the radial optical-flow pattern claimed to establish?
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
  'yes': lck-radial-direct-measure
  'no': lck-radial-scope
  qualify: lck-radial-physical-model
  unknown: lck-radial-define
  withdraw: lck-radial-define
  non_answer: lck-radial-define
  tangent: lck-radial-define
---

Interrogation lock: Define radial evidence.
