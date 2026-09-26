---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- projection
summary: 'Executable derivation: Collar object image aspect ratio.'
id: der-object-image-aspect
type: derivation
title: Collar object image aspect ratio
expression: width / height
inputs:
  width:
    node: mea-object-pixels-x
  height:
    node: mea-object-pixels-y
output:
  quantity: image_aspect_ratio
  unit: '1'
expected:
  value: 1.0222222222222221
  tolerance: 1.0e-09
---

Executable derivation: Collar object image aspect ratio.
