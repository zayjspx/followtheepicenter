---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- color
summary: 'Interrogation lock: Define the color metric.'
id: lck-pcb-color-define
type: lock
title: Define the color metric
question: If a different statistical or color metric is intended, identify the metric and the test supporting the PCB-color
  inference.
targets:
- clm-pcb-color-support
receipts:
- rec-pcb-color-values
burdens:
- bur-pcb-color-arithmetic
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-pcb-color-define
  'no': lck-pcb-color-define
  qualify: lck-pcb-color-define
  unknown: lck-pcb-color-define
  withdraw: lck-pcb-color-define
  non_answer: lck-pcb-color-define
  tangent: lck-pcb-color-define
---

Interrogation lock: Define the color metric.
