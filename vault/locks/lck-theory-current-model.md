---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Are the PETN shaped-charge claim, the site's battery/radial-pressure framing, the ballistic-gel 4940 attribution,
  and the component-ejection account all parts of one current model?
id: lck-theory-current-model
type: lock
title: Define current theory model
question: Are the PETN shaped-charge claim, the site's battery/radial-pressure framing, the ballistic-gel 4940 attribution,
  and the component-ejection account all parts of one current model?
targets:
- clm-petn-shaped-charge-hidden
- clm-july-radial-battery
- clm-4940-ballistic-gel
- clm-component-ejection-pcb-battery-magnet
receipts:
- rec-bray-petn-05g
- rec-july-radial-battery
- rec-4940-strouhal
- rec-component-ejection-timeline
burdens:
- bur-current-theory-definition
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-theory-current-effects
  'no': lck-theory-current-status
  qualify: lck-theory-current-status
  unknown: lck-theory-current-status
  withdraw: lck-theory-current-status
  non_answer: lck-theory-current-model
  tangent: lck-theory-current-model
---

Are the PETN shaped-charge claim, the site's battery/radial-pressure framing, the ballistic-gel 4940 attribution, and the component-ejection account all parts of one current model?
