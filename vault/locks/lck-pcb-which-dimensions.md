---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- dimensions
summary: 'Interrogation lock: Which dimensions identify the object?.'
id: lck-pcb-which-dimensions
type: lock
title: Which dimensions identify the object?
question: 'Which object is the dimensional analysis intended to identify: the 30×28 mm PCB or the 44×45.3 mm transmitter body?'
targets:
- clm-pcb-dimensional-30x28-support
- clm-pcb-dimensional-44mm-support
receipts:
- rec-pcb-dimensional-scale
- rec-pcb-four-independent-lines
burdens:
- bur-pcb-size-ontology
- bur-pcb-projective-calibration
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-pcb-dim30
  'no': lck-pcb-dim44
  qualify: lck-pcb-projective-scale
  unknown: lck-pcb-projective-scale
  withdraw: lck-pcb-dim44
  non_answer: lck-pcb-which-dimensions
  tangent: lck-pcb-which-dimensions
---

Interrogation lock: Which dimensions identify the object?.
