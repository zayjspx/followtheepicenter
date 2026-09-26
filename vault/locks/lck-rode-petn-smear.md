---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- petn
- specificity
summary: 'Interrogation lock: Recording-smear consequence.'
id: lck-rode-petn-smear
type: lock
title: Recording-smear consequence
question: If recording, propagation, reverberation, or microphone response can smear the event into a 2–12 ms slow rise, can
  that slow-rise waveform still uniquely diagnose the original thermal/chemical mechanism?
targets:
- clm-rode-event-not-shockwave
receipts:
- rec-rode-acoustic-classification
burdens:
- bur-rode-petn-acoustic-consistency
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-rode-petn-smear
  'no': lck-rode-petn-smear
  qualify: lck-rode-petn-smear
  unknown: lck-rode-petn-smear
  withdraw: lck-rode-petn-smear
  non_answer: lck-rode-petn-smear
  tangent: lck-rode-petn-smear
---

Interrogation lock: Recording-smear consequence.
