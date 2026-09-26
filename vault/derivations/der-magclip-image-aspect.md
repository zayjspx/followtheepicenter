---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- projection
summary: 'Executable derivation: MagClip image aspect ratio.'
id: der-magclip-image-aspect
type: derivation
title: MagClip image aspect ratio
expression: width / height
inputs:
  width:
    node: mea-magclip-pixels-x
  height:
    node: mea-magclip-pixels-y
output:
  quantity: image_aspect_ratio
  unit: '1'
expected:
  value: 2.4166666666666665
  tolerance: 1.0e-09
---

Executable derivation: MagClip image aspect ratio.
