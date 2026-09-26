---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Separate from the primary focused output, do you claim secondary pressure or gas loading is what moves
  the PCB, battery, shirt, or necklace?
id: lck-device-secondary-loading
type: lock
title: Secondary pressure/gas loading
question: Separate from the primary focused output, do you claim secondary pressure or gas loading is what moves
  the PCB, battery, shirt, or necklace?
targets:
- clm-petn-case-rupture-internals
- clm-component-ejection-pcb-battery-magnet
- clm-radial-internal-pressure
receipts:
- rec-bray-petn-05g
- rec-component-ejection-timeline
- rec-radial-pressure
burdens:
- bur-device-output-assignment
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-device-secondary-loading
  'no': lck-device-secondary-loading
  qualify: lck-device-secondary-loading
  unknown: lck-device-secondary-loading
  withdraw: lck-device-secondary-loading
  non_answer: lck-device-secondary-loading
  tangent: lck-device-secondary-loading
---

Separate from the primary focused output, do you claim secondary pressure or gas loading is what moves the PCB, battery, shirt, or necklace?
