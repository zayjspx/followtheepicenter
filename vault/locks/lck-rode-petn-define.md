---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- petn
summary: 'Interrogation lock: Define current RØDE acoustic model.'
id: lck-rode-petn-define
type: lock
title: Define current RØDE acoustic model
question: What is the current causal relationship between the alleged RØDE acoustic event and the alleged PETN shaped charge?
targets:
- clm-rode-event-chemical
- clm-petn-shaped-charge-hidden
receipts:
- rec-rode-acoustic-classification
- rec-bray-petn-05g
burdens:
- bur-rode-petn-acoustic-consistency
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-rode-petn-reconcile
  'no': lck-rode-petn-scope
  qualify: lck-rode-petn-reconcile
  unknown: lck-rode-petn-define
  withdraw: lck-rode-petn-define
  non_answer: lck-rode-petn-define
  tangent: lck-rode-petn-define
---

Interrogation lock: Define current RØDE acoustic model.
