---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- timing
summary: 'Interrogation lock: Stand by timing limitation.'
id: lck-first-audio-standby
type: lock
title: Stand by timing limitation
question: Do you agree with Section 09 that timing alone cannot distinguish a target-region Mach-cone crack from a local target-generated
  sound?
targets:
- clm-first-audio-nondiscriminating
receipts:
- rec-first-sound-nondiscriminating
burdens:
- bur-first-audio-discrimination
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-first-audio-scope
  'no': lck-first-audio-supersede
  qualify: lck-first-audio-define
  unknown: lck-first-audio-supersede
  withdraw: lck-first-audio-scope
  non_answer: lck-first-audio-standby
  tangent: lck-first-audio-standby
---

Interrogation lock: Stand by timing limitation.
