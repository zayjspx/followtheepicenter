# Bray Core Corpus v0.1 — implementation receipt

Implemented directly into the Slice 2 repository on 2026-09-26.

## Production corpus
- 4 preserved source artifacts: current EPICENTER HTML, July archived HTML, 0.5 g PETN social screenshot, 0.5 g PETN recoil-summary screenshot.
- Source-faithful receipts for PCB color/dimensions, radial optical flow, ITD, first-audio limitation, 4940 Hz, RØDE acoustic classification, medical limits, 13-of-13 claim, component ejection, and PETN social claims.
- Atomic observations, measurements, assumptions, derivations, claims, burdens, diagnostics, edges, locks and ratchets.

## Executable derivations
- 39 mm / 343 m/s -> ~113.7026 us baseline propagation delay.
- 4940 Hz * 7.62 mm / 0.2 -> ~188.214 m/s.
- MagClip image aspect 87/36 vs physical aspect 26/17.
- Object B/R minus shirt B/R = -0.151.

## Production ratchets
1. `rat-itd-nearfield`
2. `rat-4940-provenance`
3. `rat-4940-attribution`
4. `rat-pcb-dimensions`
5. `rat-pcb-color`
6. `rat-radial-pressure`
7. `rat-optflow-energy`
8. `rat-first-audio-discrimination`
9. `rat-rode-petn-consistency`
10. `rat-13of13-meaning`

## Reviewed diagnostics
- `dgn-pcb-br-arithmetic` — verified arithmetic error.
- `dgn-magclip-projection` — verified missing/projective-calibration issue.
- `dgn-itd-nearfield-exclusivity` — verified dependency gap limited to the magnitude-alone inference.
- `dgn-4940-circularity-review` — intentionally `needs-work` until independent provenance for 188 m/s is resolved.

## Audit annotations
The production vault enables deterministic Slice 2 audit candidates for:
- the PCB B/R comparison;
- the physical-size claim's pixel-domain ancestry without a connected projective calibration.

The 4940 `predicted_by` edge also exposes the dependency cycle to the circular-support detector.

No truth score or debate-winner state was added. Failed support paths reduce support; they do not automatically mark conclusions false.
