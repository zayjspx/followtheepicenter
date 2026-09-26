# Slice 3 architecture conflict report

## Renderer variance — OPEN / NON-SEMANTIC

The implementation contract listed Cytoscape.js for the global semantic graph. Package retrieval timed out in the implementation environment, and adding an unmatched dependency to `package.json` would make `npm ci` fail for the user.

Slice 3 therefore implements the same public graph contract with a dependency-free React/SVG focused-neighborhood renderer. No epistemic type, edge relation, provenance direction, ratchet rule, source boundary, or generated-data contract changed.

Resolution options after an environment with registry access is available:

1. Keep the SVG renderer because it is deterministic and deliberately avoids global graph spaghetti; or
2. install Cytoscape.js and replace only the rendering component.

This variance does not block corpus, compiler, audit, Pages, permalink, WHY, downstream-dependency, claim, receipt, source, diagnostic, or ratchet functionality.

No other frozen architecture conflict was introduced by Slice 3.
