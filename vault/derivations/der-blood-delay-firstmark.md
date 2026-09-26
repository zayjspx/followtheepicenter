---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- blood
- timing
summary: First visible mark minus frame-68 time.
id: der-blood-delay-firstmark
type: derivation
title: Delay to first visible blood mark
expression: first - start
inputs:
  first:
    node: mea-blood-f81-time
  start:
    node: mea-blood-f68-time
output:
  quantity: visible_blood_delay
  unit: ms
expected:
  value: 429
  tolerance: 0.01
depends_on:
- asm-blood-f68-vascular-breach
---

First visible mark minus frame-68 time.
