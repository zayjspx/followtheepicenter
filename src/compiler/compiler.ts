import { auditMetadataSchema, emptyAudit, validateAnnotations, type AuditMetadata } from '../audit/annotations';
import { dependencyLinks } from './provenance';
import path from 'node:path';
import { readFile, realpath } from 'node:fs/promises';
import { authoredSchema, type Authored } from '../schemas/nodes';
import { readVault, readAudit, hash, type Document } from './parser';
import { references, validateReferences } from './references';
import { quantity, convert, evaluate, type Quantity } from './arithmetic';

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return '{' + Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => JSON.stringify(k) + ':' + stable(v)).join(',') + '}';
  return JSON.stringify(value);
};
const sort = (items: Iterable<string>) => [...new Set(items)].sort();
function publishable(n: Authored) {
  return n.review_state === 'reviewed' && n.type !== 'session' && (n.type !== 'diagnostic' || n.status === 'verified');
}
async function preserveSources(nodes: Authored[], projectRoot: string) {
  const root = await realpath(projectRoot);
  const verified: { id: string; sha256: string; verification: string }[] = [];
  const bytes = new Map<string, Buffer>();
  for (const n of nodes) {
    if (n.type !== 'source') continue;
    if (n.redistribution === 'external_artifact' || n.redistribution === 'metadata_only') {
      const url = new URL(n.artifact);
      if (url.protocol !== 'https:') throw new Error('External artifact must use HTTPS: ' + n.id);
      verified.push({ id: n.id, sha256: n.sha256, verification: 'declared_hash_not_retrieved' });
      continue;
    }
    if (!n.artifact.startsWith('public/evidence/')) throw new Error('Local evidence must be under public/evidence: ' + n.id);
    const actual = await realpath(path.resolve(root, n.artifact));
    const evidenceRoot = await realpath(path.join(root, 'public/evidence'));
    const relative = path.relative(evidenceRoot, actual);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Evidence path escapes public/evidence: ' + n.id);
    const data = await readFile(actual);
    if (hash(data) !== n.sha256) throw new Error('Source hash mismatch: ' + n.id);
    bytes.set(n.id, data);
    verified.push({ id: n.id, sha256: n.sha256, verification: 'local_bytes_verified' });
  }
  const receipts: { id: string; verification: string }[] = [];
  for (const n of nodes) {
    if (n.type !== 'receipt') continue;
    const data = bytes.get(n.source);
    if (data && n.locator.kind === 'lines') {
      const lines = data.toString('utf8').replace(/\r\n/g, '\n').split('\n');
      if (n.locator.end > lines.length) throw new Error('Receipt line range exceeds source: ' + n.id);
      const excerpt = lines.slice(n.locator.start - 1, n.locator.end).join('\n');
      if (!n.quote || !excerpt.includes(n.quote)) throw new Error('Receipt quote absent from located source: ' + n.id);
      receipts.push({ id: n.id, verification: 'quote_verified_at_lines' });
    } else receipts.push({ id: n.id, verification: 'locator_structurally_valid_not_content_verified' });
  }
  return { sources: verified, receipts };
}
export async function compileDocuments(documents: Document[], projectRoot: string, auditInput: AuditMetadata = emptyAudit()) {
  const audit = auditMetadataSchema.parse(auditInput);
  audit.records.sort((a,b)=>a.id<b.id?-1:1);
  for (const a of audit.records) if (a.kind === 'independence') a.edges.sort();
  const ordered = [...documents].sort((a, b) => a.node.id < b.node.id ? -1 : a.node.id > b.node.id ? 1 : 0);
  const all = ordered.map(d => authoredSchema.parse(d.node));
  validateAnnotations(audit, all);
  const index = validateReferences(all);
  const selected = all.filter(publishable);
  const published = new Set(selected.map(n => n.id));
  for (const n of selected) for (const ref of references(n))
    if (!published.has(ref.id)) throw new Error('Reviewed/public node depends on excluded record: ' + n.id + ' -> ' + ref.id);

  // Validate authored calculations even in the review queue; publish only reviewed results.
  const values = new Map<string, Quantity>();
  const visiting = new Set<string>();
  const evaluated = new Map<string, { id: string; quantity: string; value: number; unit: string; inputs: unknown; expression: string; expected: { value: number; tolerance: number }; absolute_error: number }>();
  function numeric(id: string): Quantity {
    if (values.has(id)) return values.get(id)!;
    if (visiting.has(id)) throw new Error('Derivation input cycle: ' + [...visiting, id].join(' -> '));
    const n = index.get(id)!;
    if (n.type === 'assumption') {
      if (n.value === undefined || n.unit === undefined) throw new Error('Propositional assumption is not numeric: ' + id);
      return quantity(n.value, n.unit);
    }
    if (n.type === 'measurement') return quantity(n.value, n.unit);
    if (n.type !== 'derivation') throw new Error('Non-numeric derivation input: ' + id);
    visiting.add(id);
    const inputs: Record<string, Quantity> = Object.create(null);
    for (const [name, input] of Object.entries(n.inputs)) inputs[name] = 'node' in input ? numeric(input.node) : quantity(input.value, input.unit);
    const value = evaluate(n.expression, inputs);
    const output = convert(value, n.output.unit);
    const error = Math.abs(output - n.expected.value);
    if (error > n.expected.tolerance) throw new Error('Test oracle mismatch: ' + id + ', actual ' + output);
    evaluated.set(id, { id, quantity: n.output.quantity, value: output, unit: n.output.unit, inputs: n.inputs, expression: n.expression, expected: n.expected, absolute_error: error });
    values.set(id, value);
    visiting.delete(id);
    return value;
  }
  all.filter(n => n.type === 'derivation').forEach(n => numeric(n.id));
  const integrity = await preserveSources(all, projectRoot);
  const links = dependencyLinks(selected);
  const deps = new Map(selected.map(n => [n.id, new Set<string>()]));
  for (const link of links) deps.get(link.from)!.add(link.to);
  const provenance: Record<string, { direct: string[]; ancestors: string[]; source_roots: string[]; descendants: string[]; fingerprint: string }> = {};
  for (const n of selected) {
    const seen = new Set<string>();
    const pending = [...deps.get(n.id)!];
    while (pending.length) {
      const id = pending.pop()!;
      if (id === n.id || seen.has(id)) continue;
      seen.add(id);
      pending.push(...deps.get(id)!);
    }
    const ancestors = sort(seen);
    const ancestry = [n.id, ...ancestors].sort().map(id => {
      const doc = ordered.find(d => d.node.id === id)!;
      return { id, authored_sha256: doc.sha256 };
    });
    provenance[n.id] = {
      direct: sort(deps.get(n.id)!), ancestors,
      source_roots: sort([n.id, ...ancestors].filter(id => index.get(id)?.type === 'source')),
      descendants: [], fingerprint: hash(stable(ancestry))
    };
  }
  for (const [id, p] of Object.entries(provenance))
    p.descendants = Object.keys(provenance).filter(other => provenance[other].ancestors.includes(id)).sort();
  const inputs = ordered.map(d => ({ path: d.path, id: d.node.id, sha256: d.sha256 }));
  const buildId = hash(stable({ schema_version: 2, compiler_version: 'slice-2-v1', inputs, integrity, audit }));
  const graphData = {
    schema_version: 2, build_id: buildId,
    audit: { schema_version: 1 as const, records: audit.records.filter(a=>a.review_state==='reviewed') },
    nodes: selected.filter(n => n.type !== 'edge').map(n => ({ ...n, body: ordered.find(d => d.node.id === n.id)!.body })),
    edges: selected.filter(n => n.type === 'edge'),
    derivations: [...evaluated.values()].filter(n => published.has(n.id)).sort((a, b) => a.id.localeCompare(b.id))
  };
  const graph = { ...graphData, content_fingerprint: hash(stable(graphData)) };
  const provenanceData = { schema_version: 2, build_id: buildId, graph_fingerprint: graph.content_fingerprint, nodes: provenance, links };
  return {
    graph,
    provenance: { ...provenanceData, content_fingerprint: hash(stable(provenanceData)) },
    manifest: {
      schema_version: 2, build_id: buildId, compiler_version: 'slice-2-v1',
      authored_count: all.length, published_count: selected.length, excluded_ids: all.filter(n => !published.has(n.id)).map(n => n.id),
      inputs, integrity, audit_annotations_sha256: hash(stable(audit)), excluded_annotation_ids: audit.records.filter(a=>a.review_state!=='reviewed').map(a=>a.id),
      graph_fingerprint: graph.content_fingerprint,
      scope: 'Slice 2 compiler: hardened schemas, typed audit annotations and explicit provenance paths; no graph UI or runtime'
    }
  };
}
export async function compileVault(root: string, projectRoot: string) {
  return compileDocuments(await readVault(root), projectRoot, await readAudit(root));
}
