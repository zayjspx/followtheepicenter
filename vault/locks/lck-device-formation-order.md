---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Did the case/housing structural failure occur before or after formation of the claimed focused output?
id: lck-device-formation-order
type: lock
title: Formation versus structural failure
question: Did the case/housing structural failure occur before or after formation of the claimed focused output?
targets:
- clm-petn-case-rupture-internals
- clm-neck-wound-shrapnel-petn
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
  'yes': lck-device-secondary-loading
  'no': lck-device-secondary-loading
  qualify: lck-device-secondary-loading
  unknown: lck-device-formation-order
  withdraw: lck-device-formation-order
  non_answer: lck-device-formation-order
  tangent: lck-device-formation-order
---

Did the case/housing structural failure occur before or after formation of the claimed focused output?
