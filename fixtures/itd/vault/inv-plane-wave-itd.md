---
status: active
review_state: reviewed
created_at: 2026-09-26
updated_at: 2026-09-26
tags:
  - synthetic
  - itd
summary: Synthetic fixture for compiler verification; not evidence about a real event.
id: inv-plane-wave-itd
type: invariant
title: Fixture plane-wave constraint
statement: For a coherent two-sensor baseline d and plane wave of speed c,
  absolute delay cannot exceed d/c.
scope: Synthetic coherent two-sensor model only; reference is a test record, not
  a literature authority.
units:
  - m
  - m/s
  - us
formula: abs_dt_max = d / c
applies_when:
  - two_sensor_delay
  - approximately_plane_wave
does_not_apply_when:
  - channels_not_time_coherent
  - unknown_sensor_processing_invalidates_raw_delay
references:
  - src-itd-synthetic
---

Synthetic compiler acceptance fixture.
