---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
summary: 'Interrogation lock: Stand by radial-pressure inference.'
id: lck-radial-standby
type: lock
title: Stand by radial-pressure inference
question: Do you still interpret the radial optical-flow pattern as evidence of a physical internal pressure source?
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
  qualify: lck-radial-define
  unknown: lck-radial-direct-measure
  withdraw: lck-radial-scope
  non_answer: lck-radial-standby
  tangent: lck-radial-standby
---

Interrogation lock: Stand by radial-pressure inference.
