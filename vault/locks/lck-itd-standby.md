---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
summary: 'Interrogation lock: Stand by near-field exclusivity.'
id: lck-itd-standby
type: lock
title: Stand by near-field exclusivity
question: Do you still stand by the claim that -113.4 us is only possible from a near-field source?
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
  qualify: lck-itd-define
  unknown: lck-itd-baseline
  withdraw: lck-itd-scope
  non_answer: lck-itd-standby
  tangent: lck-itd-standby
---

Interrogation lock: Stand by near-field exclusivity.
