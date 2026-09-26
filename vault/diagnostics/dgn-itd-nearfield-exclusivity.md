---
status: verified
review_state: reviewed
created_at: '2026-09-26'
updated_at: '2026-09-26'
tags:
- audio
- itd
summary: 'Reviewed diagnostic: ITD magnitude alone does not establish near-field exclusivity.'
id: dgn-itd-nearfield-exclusivity
type: diagnostic
title: ITD magnitude alone does not establish near-field exclusivity
diagnostic_type: dependency_gap
targets:
- clm-itd-nearfield-only
depends_on:
- mea-view13-itd
- der-itd-baseline-max
statement: The reported delay is approximately equal to the propagation delay across the stated microphone baseline; magnitude
  alone therefore does not establish the published near-field-only conclusion without source/microphone geometry.
severity: load_bearing
---

Reviewed diagnostic: ITD magnitude alone does not establish near-field exclusivity.
