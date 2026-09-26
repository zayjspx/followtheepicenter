---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Which of the invoked variables—mass, exposed area, attachment strength, shielding, orientation, pressure
  gradient, or failure threshold—are actually measured or geometrically established for this device?
id: lck-component-parameters
type: lock
title: Measured component parameters
question: Which of the invoked variables—mass, exposed area, attachment strength, shielding, orientation, pressure
  gradient, or failure threshold—are actually measured or geometrically established for this device?
targets:
- clm-component-ejection-pcb-battery-magnet
receipts:
- rec-component-ejection-timeline
burdens:
- bur-component-differential-model
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-component-parameters
  'no': lck-component-parameters
  qualify: lck-component-parameters
  unknown: lck-component-parameters
  withdraw: lck-component-parameters
  non_answer: lck-component-parameters
  tangent: lck-component-parameters
---

Which of the invoked variables—mass, exposed area, attachment strength, shielding, orientation, pressure gradient, or failure threshold—are actually measured or geometrically established for this device?
