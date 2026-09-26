import type { Authored } from '../schemas/nodes';
export type Reference = { id: string; field: string; types?: Authored['type'][]; dependency: boolean };
export function references(node: Authored): Reference[] {
  const result: Reference[] = [];
  const add = (field: string, ids: string[] | undefined, types?: Authored['type'][], dependency = true) =>
    ids?.forEach(id => result.push({ id, field, types, dependency }));
  switch (node.type) {
    case 'source': add('version.supersedes', node.version.supersedes ? [node.version.supersedes] : [], ['source'], false); break;
    case 'receipt': add('source', [node.source], ['source']); break;
    case 'observation': add('receipts', node.receipts, ['receipt']); break;
    case 'measurement':
      add('method', [node.method], ['method']);
      add('observed_from', node.observed_from, ['observation']);
      add('calibration', node.calibration, ['measurement', 'derivation', 'method']); break;
    case 'assumption': add('receipts', node.receipts, ['receipt']); break;
    case 'invariant': case 'method': add('references', node.references, ['source']); break;
    case 'derivation':
      for (const [key, value] of Object.entries(node.inputs))
        if ('node' in value) add('inputs.' + key, [value.node], ['assumption', 'measurement', 'derivation']);
      add('depends_on', node.depends_on); break;
    case 'inference': add('depends_on', node.depends_on); break;
    case 'claim':
      add('receipts', node.receipts, ['receipt']);
      add('theory_models', node.theory_models, ['theory'], false); break;
    case 'burden': add('opened_by', node.opened_by, ['claim', 'inference'], false); break;
    case 'diagnostic':
      add('targets', node.targets, undefined, false);
      add('depends_on', node.depends_on); break;
    case 'lock':
      add('targets', node.targets, ['claim', 'inference'], false);
      add('receipts', node.receipts, ['receipt']);
      add('burdens', node.burdens, ['burden'], false);
      add('branches', Object.values(node.branches), ['lock'], false); break;
    case 'ratchet':
      add('entry_lock', [node.entry_lock], ['lock'], false);
      add('locks', node.locks, ['lock'], false);
      add('convergence_burdens', node.convergence_burdens, ['burden'], false); break;
    case 'theory':
      add('claims', node.claims, ['claim'], false);
      add('receipts', node.receipts, ['receipt']); break;
    case 'edge':
      add('from', [node.from], undefined, false); add('to', [node.to], undefined, false);
      add('receipts', node.receipts, ['receipt']); add('depends_on', node.depends_on); break;
  }
  return result;
}
export function validateReferences(nodes: Authored[]) {
  const index = new Map<string, Authored>();
  for (const n of nodes) {
    if (index.has(n.id)) throw new Error('Duplicate ID: ' + n.id);
    index.set(n.id, n);
  }
  for (const n of nodes) {
    for (const ref of references(n)) {
      const target = index.get(ref.id);
      if (!target) throw new Error(n.id + '.' + ref.field + ': dangling reference ' + ref.id);
      if (ref.types && !ref.types.includes(target.type)) throw new Error(n.id + '.' + ref.field + ': wrong reference type ' + target.type);
      if (n.type === 'edge' && (ref.field === 'from' || ref.field === 'to') && target.type === 'edge')
        throw new Error('Edge endpoint must be a node: ' + n.id);
    }
    if (n.type === 'source' && n.version.supersedes) {
      const prior = index.get(n.version.supersedes)!;
      if (prior.type !== 'source' || prior.version.family !== n.version.family || prior.version.sequence >= n.version.sequence)
        throw new Error('Invalid source version ordering: ' + n.id);
    }
  }
  return index;
}
