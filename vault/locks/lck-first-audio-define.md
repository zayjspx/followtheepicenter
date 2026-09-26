---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- timing
summary: 'Interrogation lock: Define first-audio evidentiary role.'
id: lck-first-audio-define
type: lock
title: Define first-audio evidentiary role
question: What exact proposition is first-audio timing intended to support in the current synthesis?
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
  qualify: lck-first-audio-scope
  unknown: lck-first-audio-define
  withdraw: lck-first-audio-define
  non_answer: lck-first-audio-define
  tangent: lck-first-audio-define
---

Interrogation lock: Define first-audio evidentiary role.
