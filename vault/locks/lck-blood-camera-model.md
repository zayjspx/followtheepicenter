---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: What camera/scene model establishes the detection threshold, including scale, lighting, background, compression,
  occlusion, and viewing geometry?
id: lck-blood-camera-model
type: lock
title: Camera detectability model
question: What camera/scene model establishes the detection threshold, including scale, lighting, background, compression,
  occlusion, and viewing geometry?
targets:
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
  'no': lck-blood-camera-model
  qualify: lck-blood-camera-model
  unknown: lck-blood-camera-model
  withdraw: lck-blood-camera-model
  non_answer: lck-blood-camera-model
  tangent: lck-blood-camera-model
---

What camera/scene model establishes the detection threshold, including scale, lighting, background, compression, occlusion, and viewing geometry?
