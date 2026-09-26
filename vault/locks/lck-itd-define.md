---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
summary: 'Interrogation lock: Define the ITD claim.'
id: lck-itd-define
type: lock
title: Define the ITD claim
question: What exactly does "only possible from a near-field source" mean in the current model?
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
  'yes': lck-itd-baseline
  'no': lck-itd-scope
  qualify: lck-itd-baseline
  unknown: lck-itd-define
  withdraw: lck-itd-define
  non_answer: lck-itd-define
  tangent: lck-itd-define
---

Interrogation lock: Define the ITD claim.
