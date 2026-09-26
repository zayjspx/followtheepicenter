---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- petn
- model-consistency
summary: 'Interrogation lock: Stand by RØDE acoustic classification.'
id: lck-rode-petn-standby
type: lock
title: Stand by RØDE acoustic classification
question: Do you still stand by the site classification that the alleged RØDE event has a slow-rise thermal/chemical signature
  "not a shockwave"?
targets:
- clm-rode-event-not-shockwave
- clm-petn-shaped-charge-hidden
receipts:
- rec-rode-acoustic-classification
- rec-bray-petn-05g
burdens:
- bur-rode-petn-acoustic-consistency
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-rode-petn-reconcile
  'no': lck-rode-petn-scope
  qualify: lck-rode-petn-define
  unknown: lck-rode-petn-reconcile
  withdraw: lck-rode-petn-scope
  non_answer: lck-rode-petn-standby
  tangent: lck-rode-petn-standby
---

Interrogation lock: Stand by RØDE acoustic classification.
