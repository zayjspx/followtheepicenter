---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- '4940'
- provenance
summary: 'Interrogation lock: Source of 188 m/s.'
id: lck-4940-source188
type: lock
title: Source of 188 m/s
question: Where does the 188 m/s value come from independently of the observed 4940 Hz tone?
targets:
- clm-4940-velocity-188
- clm-4940-strouhal
receipts:
- rec-4940-strouhal
burdens:
- bur-188-independent-provenance
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-4940-show-independent
  'no': lck-4940-derived
  qualify: lck-4940-show-independent
  unknown: lck-4940-show-independent
  withdraw: lck-4940-derived
  non_answer: lck-4940-source188
  tangent: lck-4940-source188
---

Interrogation lock: Source of 188 m/s.
