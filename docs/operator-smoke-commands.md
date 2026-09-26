# Optional operator smoke commands

These are deferred environment checks, not blockers for the authored topology/content pass.

```bash
npm ci
npm run compile
```

Expected new generated artifacts in `dist-data/`:

- `graph.json`
- `provenance.json`
- `diagnostics.json`
- `topology.json`
- `dependency-blast-radius.json`
- `interrogation-order.json`
- `build-manifest.json`

Optional broader check:

```bash
npm run typecheck
npm test
```

If any command fails, return the exact terminal output; do not hand-edit generated JSON.
