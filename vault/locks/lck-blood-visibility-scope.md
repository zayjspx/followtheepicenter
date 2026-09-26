---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: If photographic detectability is not established, should the recorded absence be treated as an unresolved
  visibility question rather than direct evidence that no spatter was produced?
id: lck-blood-visibility-scope
type: lock
title: Scope absence inference
question: If photographic detectability is not established, should the recorded absence be treated as an unresolved
  visibility question rather than direct evidence that no spatter was produced?
targets:
- clm-blood-three-predictions-fail
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
  'yes': lck-blood-visibility-scope
  'no': lck-blood-visibility-scope
  qualify: lck-blood-visibility-scope
  unknown: lck-blood-visibility-scope
  withdraw: lck-blood-visibility-scope
  non_answer: lck-blood-visibility-scope
  tangent: lck-blood-visibility-scope
---

If photographic detectability is not established, should the recorded absence be treated as an unresolved visibility question rather than direct evidence that no spatter was produced?
