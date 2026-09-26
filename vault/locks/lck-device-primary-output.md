---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Does the claimed neck injury depend on a formed shaped-charge jet/focused penetrator rather than only secondary
  blast or debris?
id: lck-device-primary-output
type: lock
title: Primary injury output
question: Does the claimed neck injury depend on a formed shaped-charge jet/focused penetrator rather than only
  secondary blast or debris?
targets:
- clm-neck-wound-shrapnel-petn
- clm-petn-shaped-charge-hidden
receipts:
- rec-bray-petn-05g
burdens:
- bur-device-output-assignment
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-device-formation-order
  'no': lck-device-name-output
  qualify: lck-device-name-output
  unknown: lck-device-primary-output
  withdraw: lck-device-primary-output
  non_answer: lck-device-primary-output
  tangent: lck-device-primary-output
---

Does the claimed neck injury depend on a formed shaped-charge jet/focused penetrator rather than only secondary blast or debris?
