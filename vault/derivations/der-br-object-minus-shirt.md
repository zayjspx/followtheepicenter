---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- color
- calculation
summary: 'Executable derivation: Object minus shirt B/R.'
id: der-br-object-minus-shirt
type: derivation
title: Object minus shirt B/R
expression: object_br - shirt_br
inputs:
  object_br:
    node: mea-pcb-object-br
  shirt_br:
    node: mea-pcb-shirt-br
output:
  quantity: blue_red_ratio_difference
  unit: '1'
expected:
  value: -0.15100000000000002
  tolerance: 1.0e-12
---

Executable derivation: Object minus shirt B/R.
