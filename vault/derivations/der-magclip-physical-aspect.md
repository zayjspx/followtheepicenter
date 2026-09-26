---
status: active
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- projection
summary: 'Executable derivation: MagClip physical aspect ratio.'
id: der-magclip-physical-aspect
type: derivation
title: MagClip physical aspect ratio
expression: width / height
inputs:
  width:
    node: asm-magclip-width-26mm
  height:
    node: asm-magclip-height-17mm
output:
  quantity: physical_aspect_ratio
  unit: '1'
expected:
  value: 1.5294117647058822
  tolerance: 1.0e-09
---

Executable derivation: MagClip physical aspect ratio.
