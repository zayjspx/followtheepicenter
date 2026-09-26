---
status: active
review_state: reviewed
created_at: 2026-09-26
updated_at: 2026-09-26
tags:
  - synthetic
  - slice-2
summary: Synthetic audit test data. Not evidence about any real person or event.
id: der-velocity
type: derivation
title: der-velocity
expression: frequency * diameter / strouhal
inputs:
  frequency:
    node: mea-frequency
  diameter:
    node: asm-diameter
  strouhal:
    node: asm-strouhal
output:
  quantity: gas_velocity
  unit: m/s
expected:
  value: 188.214
  tolerance: 0.001
---

Synthetic software acceptance fixture.
