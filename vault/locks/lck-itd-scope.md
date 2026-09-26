---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
summary: 'Interrogation lock: Scope the ITD claim.'
id: lck-itd-scope
type: lock
title: Scope the ITD claim
question: Which narrower claim replaces the near-field-only statement if you no longer stand by it?
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
  'yes': lck-itd-scope
  'no': lck-itd-scope
  qualify: lck-itd-scope
  unknown: lck-itd-scope
  withdraw: lck-itd-scope
  non_answer: lck-itd-scope
  tangent: lck-itd-scope
---

Interrogation lock: Scope the ITD claim.
