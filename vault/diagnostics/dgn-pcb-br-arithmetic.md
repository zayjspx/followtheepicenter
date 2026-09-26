---
status: verified
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- color
- arithmetic
summary: 'Reviewed diagnostic: PCB B/R arithmetic inconsistency.'
id: dgn-pcb-br-arithmetic
type: diagnostic
title: PCB B/R arithmetic inconsistency
diagnostic_type: arithmetic_error
targets:
- clm-pcb-object-exceeds-shirt-br
depends_on:
- mea-pcb-object-br
- mea-pcb-shirt-br
- der-br-object-minus-shirt
statement: The published values give object B/R = 0.567 and shirt B/R = 0.718 while the text says the object exceeds the shirt
  value.
severity: significant
---

Reviewed diagnostic: PCB B/R arithmetic inconsistency.
