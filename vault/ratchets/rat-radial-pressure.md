---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- optical-flow
- pressure
summary: 'Production interrogation ratchet: Radial optical flow to pressure.'
id: rat-radial-pressure
type: ratchet
title: Radial optical flow to pressure
entry_lock: lck-radial-standby
locks:
- lck-radial-standby
- lck-radial-direct-measure
- lck-radial-conversion
- lck-radial-physical-model
- lck-radial-scope
- lck-radial-define
convergence_burdens:
- bur-optflow-pressure-bridge
closure_states:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
---

Production interrogation ratchet: Radial optical flow to pressure.
