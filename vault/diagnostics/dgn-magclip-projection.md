---
status: verified
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- pcb
- projection
summary: 'Reviewed diagnostic: MagClip projection requires calibration.'
id: dgn-magclip-projection
type: diagnostic
title: MagClip projection requires calibration
diagnostic_type: missing_calibration
targets:
- clm-pcb-dimensional-30x28-support
- clm-pcb-dimensional-44mm-support
depends_on:
- der-magclip-image-aspect
- der-magclip-physical-aspect
- asm-magclip-object-scale-transfer
statement: The alleged scale reference appears with an image aspect ratio substantially different from its stated physical
  aspect ratio, establishing projection/orientation effects that require correction before direct scale transfer.
severity: significant
---

Reviewed diagnostic: MagClip projection requires calibration.
