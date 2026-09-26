---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- dimensions
summary: 'Interrogation lock: 44 mm branch.'
id: lck-pcb-dim44
type: lock
title: 44 mm branch
question: If the dimensional evidence is matching the 44×45.3 mm TX-body profile, what dimensional evidence specifically identifies
  the smaller 30×28 mm circuit board cited in the synthesis?
targets:
- clm-pcb-dimensional-44mm-support
receipts:
- rec-pcb-dimensional-scale
- rec-pcb-four-independent-lines
burdens:
- bur-pcb-size-ontology
closure:
- burden_satisfied
- claim_withdrawn
- claim_qualified
- unresolved
branches:
  'yes': lck-pcb-projective-scale
  'no': lck-pcb-which-dimensions
  qualify: lck-pcb-projective-scale
  unknown: lck-pcb-dim44
  withdraw: lck-pcb-dim44
  non_answer: lck-pcb-dim44
  tangent: lck-pcb-dim44
---

Interrogation lock: 44 mm branch.
