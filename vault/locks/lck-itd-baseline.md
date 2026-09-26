---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
summary: 'Interrogation lock: Baseline-delay question.'
id: lck-itd-baseline
type: lock
title: Baseline-delay question
question: Your stated microphone path difference is about 3.9 cm. At 343 m/s, that corresponds to about 113.7 us. What prevents
  a far-field wave at an appropriate incidence angle from producing approximately 113.4 us across that baseline?
targets:
- clm-itd-nearfield-only
receipts:
- rec-itd-nearfield
burdens:
- bur-itd-farfield-exclusion
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-itd-orientation
  'no': lck-itd-scope
  qualify: lck-itd-orientation
  unknown: lck-itd-orientation
  withdraw: lck-itd-scope
  non_answer: lck-itd-baseline
  tangent: lck-itd-baseline
---

Interrogation lock: Baseline-delay question.
