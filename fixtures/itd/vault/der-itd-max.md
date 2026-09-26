---
status: active
review_state: reviewed
created_at: 2026-09-26
updated_at: 2026-09-26
tags:
  - synthetic
  - itd
summary: Synthetic fixture for compiler verification; not evidence about a real event.
id: der-itd-max
type: derivation
title: Maximum delay calculation
expression: baseline / sound_speed
inputs:
  baseline:
    node: asm-phone-baseline-39mm
  sound_speed:
    value: 343
    unit: m/s
output:
  quantity: max_plane_wave_itd
  unit: us
expected:
  value: 113.7
  tolerance: 0.05
depends_on:
  - inv-plane-wave-itd
---

Synthetic compiler acceptance fixture.
