---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Does the physical model predict blood production, or does it also predict that the produced blood must
  be visibly detectable in these specific recordings?
id: lck-blood-detectability
type: lock
title: Blood production versus visibility
question: Does the physical model predict blood production, or does it also predict that the produced blood must
  be visibly detectable in these specific recordings?
targets:
- clm-blood-three-predictions-fail
- clm-blood-photo-resolvable-1ml
receipts:
- rec-blood-delay
burdens:
- bur-blood-detectability
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-blood-camera-model
  'no': lck-blood-visibility-scope
  qualify: lck-blood-camera-model
  unknown: lck-blood-detectability
  withdraw: lck-blood-detectability
  non_answer: lck-blood-detectability
  tangent: lck-blood-detectability
---

Does the physical model predict blood production, or does it also predict that the produced blood must be visibly detectable in these specific recordings?
