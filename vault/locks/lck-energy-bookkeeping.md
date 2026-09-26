---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- lock
summary: Show how the accepted device model allocates energy or impulse among the focused output, recoil, case rupture,
  component acceleration, shirt/necklace motion, and gas/blast loading.
id: lck-energy-bookkeeping
type: lock
title: Energy/impulse allocation
question: Show how the accepted device model allocates energy or impulse among the focused output, recoil, case
  rupture, component acceleration, shirt/necklace motion, and gas/blast loading.
targets:
- clm-petn-recoil-22-5j
- clm-component-ejection-pcb-battery-magnet
- clm-radial-internal-pressure
receipts:
- rec-bray-petn-recoil-05g
- rec-component-ejection-timeline
- rec-radial-pressure
burdens:
- bur-energy-impulse-bookkeeping
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- contradiction_acknowledged
- unresolved
branches:
  'yes': lck-energy-doublecount
  'no': lck-energy-doublecount
  qualify: lck-energy-doublecount
  unknown: lck-energy-bookkeeping
  withdraw: lck-energy-bookkeeping
  non_answer: lck-energy-bookkeeping
  tangent: lck-energy-bookkeeping
---

Show how the accepted device model allocates energy or impulse among the focused output, recoil, case rupture, component acceleration, shirt/necklace motion, and gas/blast loading.
