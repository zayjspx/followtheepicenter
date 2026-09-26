---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- '4940'
- strouhal
summary: 'Executable derivation: Velocity implied by 4940 Hz.'
id: der-velocity-from-4940
type: derivation
title: Velocity implied by 4940 Hz
expression: frequency * diameter / strouhal
inputs:
  frequency:
    node: mea-tone-frequency
  diameter:
    node: asm-orifice-762mm
  strouhal:
    node: asm-strouhal-02
output:
  quantity: inferred_exit_velocity
  unit: m/s
expected:
  value: 188.214
  tolerance: 0.001
---

Executable derivation: Velocity implied by 4940 Hz.
