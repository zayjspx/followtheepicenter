---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- '4940'
- attribution
summary: 'Interrogation lock: TDOA location or identity.'
id: lck-4940-location-or-identity
type: lock
title: TDOA location or identity
question: Does the TDOA result identify a location, or identify ballistic gel as the physical source?
targets:
- clm-4940-ballistic-gel
- clm-4940-van-association
receipts:
- rec-4940-strouhal
burdens:
- bur-gel-source-identification
- bur-location-to-object-attribution
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-4940-identify-gel
  'no': lck-4940-identify-gel
  qualify: lck-4940-identify-gel
  unknown: lck-4940-identify-gel
  withdraw: lck-4940-identify-gel
  non_answer: lck-4940-location-or-identity
  tangent: lck-4940-location-or-identity
---

Interrogation lock: TDOA location or identity.
