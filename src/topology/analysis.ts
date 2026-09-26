import { createHash } from 'node:crypto';

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => JSON.stringify(k) + ':' + stable(v)).join(',') + '}';
  return JSON.stringify(value);
};
const hash = (v: unknown) => createHash('sha256').update(stable(v)).digest('hex');
const uniq = <T>(xs: T[]) => [...new Set(xs)];
const sorted = (xs: string[]) => uniq(xs).sort();

type AnyNode = Record<string, any> & { id: string; type: string };
type Edge = AnyNode & { type: 'edge'; from: string; to: string; relation: string };
type Graph = { build_id: string; nodes: AnyNode[]; edges: Edge[] };
type Provenance = { nodes: Record<string, { direct: string[]; ancestors: string[]; descendants: string[]; source_roots: string[] }> };
type Diagnostics = { candidates?: Array<{ detector: string; triggering_nodes: string[]; id: string }> };

export function analyzeTopology(graph: Graph, provenance: Provenance, diagnostics: Diagnostics) {
  const nodes = new Map(graph.nodes.map(n => [n.id, n]));
  const edges = graph.edges;
  const requires = new Map<string, string[]>();
  const triggers = new Map<string, string[]>();
  const blocked = new Map<string, string[]>();
  const support = new Map<string, string[]>();
  for (const e of edges) {
    if (e.relation === 'requires') (requires.get(e.from) ?? requires.set(e.from, []).get(e.from)!).push(e.to);
    if (e.relation === 'triggers') (triggers.get(e.from) ?? triggers.set(e.from, []).get(e.from)!).push(e.to);
    if (e.relation === 'blocks_escape') (blocked.get(e.from) ?? blocked.set(e.from, []).get(e.from)!).push(e.to);
    if (['supports', 'weakly_supports', 'uniquely_supports', 'discriminates_for', 'predicted_by'].includes(e.relation)) {
      const target = e.relation === 'predicted_by' ? e.from : e.to;
      const evidence = e.relation === 'predicted_by' ? e.to : e.from;
      (support.get(target) ?? support.set(target, []).get(target)!).push(evidence);
    }
  }

  const burdenCache = new Map<string, string[]>();
  const inheritedBurdenCache = new Map<string, string[]>();
  const directBurdens = (id: string) => sorted((requires.get(id) ?? []).filter(x => nodes.get(x)?.type === 'burden'));
  function inheritedBurdens(id: string): string[] {
    if (inheritedBurdenCache.has(id)) return inheritedBurdenCache.get(id)!;
    const p = provenance.nodes[id];
    const direct = new Set(directBurdens(id));
    const inherited = new Set<string>();
    for (const ancestor of p?.ancestors ?? []) {
      for (const b of directBurdens(ancestor)) if (!direct.has(b)) inherited.add(b);
    }
    const out = sorted([...inherited]); inheritedBurdenCache.set(id, out); return out;
  }
  function allBurdens(id: string): string[] {
    if (burdenCache.has(id)) return burdenCache.get(id)!;
    const out = sorted([...directBurdens(id), ...inheritedBurdens(id)]); burdenCache.set(id, out); return out;
  }

  const claims = graph.nodes.filter(n => n.type === 'claim').sort((a,b)=>a.id.localeCompare(b.id));
  const claim_state = Object.fromEntries(claims.map(c => {
    const direct = directBurdens(c.id), inherited = inheritedBurdens(c.id), supports = sorted(support.get(c.id) ?? []);
    const downstreamClaims = sorted((provenance.nodes[c.id]?.descendants ?? []).filter(id => nodes.get(id)?.type === 'claim'));
    return [c.id, {
      direct_burdens: direct,
      inherited_burdens: inherited,
      all_burdens: sorted([...direct, ...inherited]),
      support_paths: supports,
      downstream_claims: downstreamClaims,
      structural_state: direct.length || inherited.length ? 'burdened' : supports.length ? 'supported' : 'unscored',
      note: 'Structural state only; not a truth judgment.'
    }];
  }));

  const ratchets = graph.nodes.filter(n => n.type === 'ratchet').sort((a,b)=>a.id.localeCompare(b.id));
  const ratchet_topology = Object.fromEntries(ratchets.map(r => {
    const locks = (r.locks as string[]).map(id => nodes.get(id)).filter(Boolean) as AnyNode[];
    const targets = sorted(locks.flatMap(l => l.targets ?? []));
    const activatedBy = sorted(edges.filter(e => e.relation === 'triggers' && e.to === r.id).map(e => e.from));
    const escapes = sorted(locks.flatMap(l => blocked.get(l.id) ?? []));
    const callbacks = sorted(targets.flatMap(id => triggers.get(id) ?? []).filter(id => id !== r.id));
    return [r.id, {
      entry_lock: r.entry_lock,
      convergence_burdens: r.convergence_burdens,
      targets,
      activated_by: activatedBy,
      blocked_response_patterns: escapes,
      cross_ratchet_callbacks: callbacks
    }];
  }));

  const response_patterns = Object.fromEntries(graph.nodes.filter(n=>n.type==='escape').sort((a,b)=>a.id.localeCompare(b.id)).map(e => [e.id, {
    pattern: e.pattern,
    statement: e.statement,
    blocked_by_locks: sorted(edges.filter(x => x.relation === 'blocks_escape' && x.to === e.id).map(x => x.from))
  }]));

  const payload = { schema_version: 1, build_id: graph.build_id, claim_state, ratchets: ratchet_topology, response_patterns };
  return { ...payload, fingerprint: hash(payload) };
}

export function buildBlastRadius(graph: Graph, provenance: Provenance) {
  const nodes = new Map(graph.nodes.map(n => [n.id, n]));
  const records: Record<string, unknown> = {};
  for (const n of [...graph.nodes].sort((a,b)=>a.id.localeCompare(b.id))) {
    const descendants = provenance.nodes[n.id]?.descendants ?? [];
    records[n.id] = {
      type: n.type,
      downstream_claims: sorted(descendants.filter(id => nodes.get(id)?.type === 'claim')),
      downstream_burdens: sorted(descendants.filter(id => nodes.get(id)?.type === 'burden')),
      downstream_diagnostics: sorted(descendants.filter(id => nodes.get(id)?.type === 'diagnostic')),
      downstream_ratchets: sorted(descendants.filter(id => nodes.get(id)?.type === 'ratchet')),
      descendant_count: descendants.length,
      note: 'Dependency blast radius is structural ancestry, not a claim that descendants become false if this node changes.'
    };
  }
  const payload = {schema_version:1,build_id:graph.build_id,records};
  return {...payload,fingerprint:hash(payload)};
}

export function compileInterrogationOrder(graph: Graph, provenance: Provenance, diagnostics: Diagnostics) {
  const nodes = new Map(graph.nodes.map(n=>[n.id,n]));
  const verifiedDiagnostics = graph.nodes.filter(n=>n.type==='diagnostic' && n.status==='verified');
  const candidates = diagnostics.candidates ?? [];
  const ratchets = graph.nodes.filter(n=>n.type==='ratchet');
  const entries = ratchets.map(r => {
    const locks=(r.locks as string[]).map(id=>nodes.get(id)).filter(Boolean) as AnyNode[];
    const targets=sorted(locks.flatMap(l=>l.targets??[]));
    const downstreamClaims=sorted(targets.flatMap(id=>(provenance.nodes[id]?.descendants??[]).filter(x=>nodes.get(x)?.type==='claim')));
    const burdens=sorted(r.convergence_burdens ?? []);
    const verified=verifiedDiagnostics.filter(d => (d.targets??[]).some((x:string)=>targets.includes(x)) || (d.depends_on??[]).some((x:string)=>targets.includes(x))).map(d=>d.id).sort();
    const candidateIds=candidates.filter(c => c.triggering_nodes?.some(x=>targets.includes(x))).map(c=>c.id).sort();
    const activatedBy=sorted(graph.edges.filter(e=>e.relation==='triggers'&&e.to===r.id).map(e=>e.from));
    return {
      ratchet:r.id,
      entry_lock:r.entry_lock,
      convergence_burdens:burdens,
      targets,
      activated_by:activatedBy,
      downstream_claim_count:downstreamClaims.length,
      downstream_claims:downstreamClaims,
      verified_diagnostics:verified,
      audit_candidates:candidateIds,
      structural_key:[downstreamClaims.length,verified.length,activatedBy.length,burdens.length],
      reason:'Ordered by structural downstream reach, then verified diagnostics, trigger breadth, and convergence burdens. This is not a truth or credibility score.'
    };
  });
  entries.sort((a,b)=>{
    for(let i=0;i<a.structural_key.length;i++) if(a.structural_key[i]!==b.structural_key[i]) return b.structural_key[i]-a.structural_key[i];
    return a.ratchet.localeCompare(b.ratchet);
  });
  const payload={schema_version:1,build_id:graph.build_id,baseline_order:entries.map((e,i)=>({...e,position:i+1}))};
  return {...payload,fingerprint:hash(payload)};
}
