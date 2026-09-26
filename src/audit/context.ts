import type { compileDocuments } from '../compiler/compiler';
import { authoredSchema, type Authored } from '../schemas/nodes';
import { canonical, dependencyLinks, type Step } from '../compiler/provenance';
import { validateReferences } from '../compiler/references';
import { hash } from '../compiler/parser';
import { quantity, convert } from '../compiler/arithmetic';
import { auditMetadataSchema, validateAnnotations } from './annotations';
import { candidateSchema, diagnosticClass, type Candidate } from './candidates';
export type Compiled=Awaited<ReturnType<typeof compileDocuments>>;
export type Path={nodes:string[];steps:Step[]};
export const sorted=(ids:Iterable<string>)=>[...new Set(ids)].sort();
export const imageUnits=new Set(['px','px/frame','px/s','frame','rgb','digital_amplitude','sample']);
export class AuditContext {
  readonly index:Map<string,Authored>;
  readonly records:Compiled['graph']['audit']['records'];
  readonly links:Step[];
  readonly results:Candidate[]=[];
  constructor(readonly graph:Compiled['graph'],readonly provenance:Compiled['provenance']) {
    if(graph.schema_version!==2 || provenance.schema_version!==2) throw new Error('Unsupported compiled graph/provenance version');
    const {content_fingerprint:gf,...g}=graph;
    const {content_fingerprint:pf,...p}=provenance;
    if(hash(canonical(g))!==gf || hash(canonical(p))!==pf || provenance.graph_fingerprint!==gf || provenance.build_id!==graph.build_id)
      throw new Error('Graph/provenance integrity or build mismatch');
    const nodes=graph.nodes.map(n=>{const {body,...record}=n;return authoredSchema.parse(record);});
    const edges=graph.edges.map(e=>authoredSchema.parse(e));
    if(nodes.some(n=>n.type==='edge') || edges.some(n=>n.type!=='edge')) throw new Error('Invalid compiled graph partition');
    const all=[...nodes,...edges];
    if(all.some(n=>n.review_state!=='reviewed'||n.type==='session'||(n.type==='diagnostic'&&n.status!=='verified')))
      throw new Error('Audit requires reviewed public graph');
    this.index=validateReferences(all);
    this.records=auditMetadataSchema.parse(graph.audit).records.sort((a,b)=>a.id<b.id?-1:1);
    if(this.records.some(a=>a.review_state!=='reviewed')) throw new Error('Compiled audit annotations must be reviewed');
    validateAnnotations({schema_version:1,records:this.records},all);
    const expected=dependencyLinks(all);
    if(canonical(expected)!==canonical(provenance.links)) throw new Error('Compiled provenance links do not match graph');
    this.links=expected.filter(l=>l.via.kind!=='edge'||this.active(l.via.id));
    const derivations=new Map(graph.derivations.map(d=>[d.id,d]));
    if(derivations.size!==graph.derivations.length || derivations.size!==nodes.filter(n=>n.type==='derivation').length) throw new Error('Missing/duplicate compiled derivation');
    for(const d of graph.derivations) {
      const n=this.index.get(d.id);
      if(n?.type!=='derivation'||!Number.isFinite(d.value)||d.unit!==n.output.unit||d.quantity!==n.output.quantity)
        throw new Error('Invalid compiled derivation result');
      quantity(d.value,d.unit);
    }
  }
  active(id:string) {const n=this.index.get(id);return n?.review_state==='reviewed'&&n.status==='active';}
  node(id:string) {const n=this.index.get(id);if(!n)throw new Error('Unknown compiled ID: '+id);return n;}
  path(from:string,to:string,options:{excludeEdge?:string;dataOnly?:boolean}={}):Path|undefined {
    const queue:Path[]=[{nodes:[from],steps:[]}], seen=new Set([from]);
    for(let i=0;i<queue.length;i++) {
      const p=queue[i],tail=p.nodes[p.nodes.length-1];
      if(tail===to) return p;
      for(const l of this.links.filter(l=>l.from===tail)) {
        if(l.via.kind==='edge'&&l.via.id===options.excludeEdge) continue;
        if(options.dataOnly && (['method','invariant','edge'].includes(this.node(l.to).type)||l.via.field==='rationale_dependency')) continue;
        if(seen.has(l.to))continue;
        seen.add(l.to);queue.push({nodes:[...p.nodes,l.to],steps:[...p.steps,l]});
      }
    }
  }
  numeric(id:string,unit:string) {
    const n=this.node(id);
    if(n.type==='measurement')return convert(quantity(n.value,n.unit),unit);
    if(n.type==='assumption'&&n.value!==undefined&&n.unit!==undefined)return convert(quantity(n.value,n.unit),unit);
    if(n.type==='derivation') {
      const d=this.graph.derivations.find(d=>d.id===id);
      if(!d)throw new Error('Missing compiled derivation: '+id);
      return convert(quantity(d.value,d.unit),unit);
    }
    throw new Error('Non-numeric compiled operand: '+id);
  }
  emit(detector:Candidate['detector'],identity:string,paths:Path[],annotations:string[],explanation:string,evidence:Record<string,unknown>,extraEdges:string[]=[]) {
    const uniquePaths=[...new Map(paths.map(p=>[canonical(p),p])).values()].sort((a,b)=>canonical(a)<canonical(b)?-1:1);
    for(const p of uniquePaths) {
      if(p.steps.length!==p.nodes.length-1)throw new Error('Invalid diagnostic path');
      p.steps.forEach((s,i)=>{if(s.from!==p.nodes[i]||s.to!==p.nodes[i+1])throw new Error('Broken diagnostic path');});
    }
    const core={
      id:'dgn-candidate-'+hash(detector+':'+identity).slice(0,24),detector,diagnostic_type:diagnosticClass[detector],
      status:'candidate' as const,review_state:'machine_proposed' as const,
      triggering_nodes:sorted(uniquePaths.flatMap(p=>p.nodes).filter(id=>this.node(id).type!=='edge')),
      triggering_edges:sorted([...extraEdges,...uniquePaths.flatMap(p=>p.steps.filter(s=>s.via.kind==='edge').map(s=>s.via.id))]),
      triggering_annotations:sorted(annotations),dependency_paths:uniquePaths,explanation,evidence
    };
    const fingerprint=hash(canonical({
      engine:'slice-2-v1',candidate:core,
      records:sorted([...core.triggering_nodes,...core.triggering_edges]).map(id=>this.node(id)),
      annotations:this.records.filter(a=>core.triggering_annotations.includes(a.id))
    }));
    this.results.push(candidateSchema.parse({...core,fingerprint}));
  }
}
export function annotationPath(from:string,to:string,id:string,field:string):Path {
  return {nodes:[from,to],steps:[{from,to,via:{kind:'annotation',id,field}}]};
}
export function joinPaths(a:Path,b:Path):Path {
  if(a.nodes.at(-1)!==b.nodes[0])throw new Error('Cannot join unrelated paths');
  return {nodes:[...a.nodes,...b.nodes.slice(1)],steps:[...a.steps,...b.steps]};
}
