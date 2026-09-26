---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- blood
- timing
summary: Unambiguous blood time minus frame-68 time.
id: der-blood-delay-unambiguous
type: derivation
title: Delay to unambiguous visible blood
expression: blood - start
inputs:
  blood:
    node: mea-blood-f82-time
  start:
    node: mea-blood-f68-time
output:
  quantity: visible_blood_delay
  unit: ms
expected:
  value: 461
  tolerance: 0.01
depends_on:
- asm-blood-f68-vascular-breach
---

Unambiguous blood time minus frame-68 time.
