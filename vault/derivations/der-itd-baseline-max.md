---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
- calculation
summary: 'Executable derivation: Baseline propagation delay.'
id: der-itd-baseline-max
type: derivation
title: Baseline propagation delay
expression: baseline / sound_speed
inputs:
  baseline:
    node: asm-phone-baseline-39mm
  sound_speed:
    node: asm-sound-speed-343
output:
  quantity: baseline_propagation_delay
  unit: us
expected:
  value: 113.7026239067
  tolerance: 0.0001
---

Executable derivation: Baseline propagation delay.
