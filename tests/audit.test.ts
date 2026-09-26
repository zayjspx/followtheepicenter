import {describe,it,expect} from 'vitest';
import {readAudit,readVault,hash,type Document} from '../src/compiler/parser';
import {compileDocuments,compileVault} from '../src/compiler/compiler';
import {auditGraph} from '../src/audit/engine';
import {auditMetadataSchema,type AuditMetadata} from '../src/audit/annotations';
import {candidateSchema,detectorNames} from '../src/audit/candidates';
import {authoredSchema} from '../src/schemas/nodes';
import {canonical} from '../src/compiler/provenance';
const cases=[['4940','circular_support'],['pcb-color','arithmetic_contradiction'],['pcb-size','active_claim_conflict'],['pseudo-independent','pseudo_independence'],['assumption-laundering','assumption_laundering'],['missing-calibration','missing_calibration'],['active-claim-conflict','active_claim_conflict']] as const;
async function inputs(f:string,negative=false){const p='fixtures/'+f+(negative?'/negative':'')+'/vault';return{docs:await readVault(p),audit:await readAudit(p)};}
async function run(f:string,negative=false){const c=await compileVault('fixtures/'+f+(negative?'/negative':'')+'/vault',process.cwd());return{...c,diagnostics:auditGraph(c.graph,c.provenance)};}
async function changed(f:string,change:(d:Document[],a:AuditMetadata)=>void,negative=false){
 const {docs,audit}=await inputs(f,negative);change(docs,audit);for(const d of docs)d.sha256=hash(canonical(d.node));
 const c=await compileDocuments(docs,process.cwd(),audit);return{...c,diagnostics:auditGraph(c.graph,c.provenance)};
}
const find=(d:Document[],id:string):any=>d.find(d=>d.node.id===id)!.node;
function shuffle<T>(items:T[],seed:number){const a=[...items];for(let i=a.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
describe.each(cases)('%s fixture',(family,detector)=>{
 it('emits exactly the intended detector with candidate state and step locators',async()=>{
  const r=await run(family);expect(r.diagnostics.candidates.map(c=>c.detector)).toEqual([detector]);
  const c=r.diagnostics.candidates[0];expect(candidateSchema.safeParse(c).success).toBe(true);
  expect(c.status).toBe('candidate');expect(c.review_state).toBe('machine_proposed');
  for(const p of c.dependency_paths){expect(p.steps.length).toBe(p.nodes.length-1);for(const [i,s] of p.steps.entries()){
   expect([s.from,s.to]).toEqual([p.nodes[i],p.nodes[i+1]]);
   if(s.via.kind==='edge')expect(r.graph.edges.some(e=>e.id===s.via.id)).toBe(true);
   if(s.via.kind==='annotation')expect(r.graph.audit.records.some(a=>a.id===s.via.id)).toBe(true);
  }}
 });
 it('emits no candidates from any detector for the near miss',async()=>expect((await run(family,true)).diagnostics.candidates).toEqual([]));
 it('is deterministic under shuffled files and annotations',async()=>{
  const {docs,audit}=await inputs(family),base=await compileDocuments(docs,process.cwd(),audit),expected=auditGraph(base.graph,base.provenance);
  for(const seed of [7,61,2026]){const c=await compileDocuments(shuffle(docs,seed),process.cwd(),{...audit,records:shuffle(audit.records,seed)});expect(c).toEqual(base);expect(auditGraph(c.graph,c.provenance)).toEqual(expected);}
 });
 it('never mutates or promotes the reviewed graph on repeated audits',async()=>{
  const c=await run(family),before=canonical({g:c.graph,p:c.provenance});
  const freeze=(v:any)=>{if(v&&typeof v==='object'){Object.freeze(v);Object.values(v).forEach(freeze);}};freeze(c.graph);freeze(c.provenance);
  expect(auditGraph(c.graph,c.provenance)).toEqual(c.diagnostics);
  expect(canonical({g:c.graph,p:c.provenance})).toBe(before);
  expect(c.graph.nodes.some(n=>n.id===c.diagnostics.candidates[0].id)).toBe(false);
 });
});
describe('gold evidence',()=>{
 it('exposes the complete 4940 dependency cycle and closing prediction edge',async()=>{
  const r=await run('4940'),c=r.diagnostics.candidates[0],p=c.dependency_paths[0];
  expect(r.graph.derivations[0].value).toBeCloseTo(188.214,10);
  expect(p.nodes).toEqual(['der-velocity','mea-frequency','obs-record','der-velocity']);
  expect(p.steps.map(s=>s.via.field)).toEqual(['inputs.frequency','observed_from','predicted_by']);
  expect(c.triggering_edges).toEqual(['edg-prediction']);
 });
 it('evaluates the typed arithmetic relation without reading prose',async()=>{
  const r=await changed('pcb-color',d=>{find(d,'clm-exceeds').statement='Prose has no numerical relation.';});
  expect(r.diagnostics.candidates[0].evidence).toMatchObject({left:0.567,right:0.718,operator:'gt',relation_holds:false});
 });
 it('shows the shared root and all three transform branches',async()=>{
  const c=(await run('pseudo-independent')).diagnostics.candidates[0];
  expect(c.evidence.shared_roots).toEqual(['src-record']);
  expect(c.triggering_edges).toEqual(['edg-clahe','edg-false-color','edg-optical-flow']);
  expect(c.dependency_paths.every(p=>p.nodes.at(-1)==='src-record')).toBe(true);
 });
 it('shows the complete laundering ancestry',async()=>{
  const c=(await run('assumption-laundering')).diagnostics.candidates[0];
  expect(c.dependency_paths[0].nodes).toEqual(['clm-speed','mea-speed','asm-speed']);
  expect(c.triggering_edges).toEqual(['edg-origin','edg-support']);
 });
 it('keeps all detectors silent for ITD',async()=>{const c=await compileVault('fixtures/itd/vault',process.cwd());expect(auditGraph(c.graph,c.provenance).candidates).toEqual([]);});
});
describe('near misses and boundaries',()=>{
 it.each(['pseudo-independent','assumption-laundering'])('requires an independence assertion: %s',async f=>expect((await changed(f,(_,a)=>{a.records=[];})).diagnostics.candidates).toEqual([]));
 it('detects derivation ancestry as well as assumptions',async()=>{
  const r=await changed('assumption-laundering',d=>{
   find(d,'edg-origin').to='der-speed';
   const old=find(d,'asm-speed'),{quantity,value,unit,basis,receipts,...envelope}=old;
   d.push({path:'der-speed.md',body:'',sha256:'',node:authoredSchema.parse({...envelope,id:'der-speed',type:'derivation',expression:'speed',inputs:{speed:{value:188,unit:'m/s'}},output:{quantity:'speed',unit:'m/s'},expected:{value:188,tolerance:0}})});
  });
  expect(r.diagnostics.candidates.map(c=>c.detector)).toEqual(['assumption_laundering']);
  expect(r.diagnostics.candidates[0].evidence.origins).toEqual(['der-speed']);
 });
 it.each(['scope','quantity'])('does not infer conflict across distinct %s',async field=>expect((await changed('pcb-size',(_,a)=>{(a.records[1] as any)[field]='other';})).diagnostics.candidates).toEqual([]));
 it('converts compatible units and respects overlapping intervals',async()=>expect((await changed('pcb-size',(_,a)=>Object.assign(a.records[1],{value:0.0304,unit:'m',tolerance:0.0001}))).diagnostics.candidates).toEqual([]));
 it('deduplicates explicit and typed conflict evidence',async()=>{
  const r=await changed('pcb-size',d=>{
   const old=find(d,'clm-width-a'),{statement,asserted_by,receipts,theory_models,epistemic_state,...envelope}=old;
   d.push({path:'edg-conflict.md',body:'',sha256:'',node:authoredSchema.parse({...envelope,id:'edg-conflict',type:'edge',from:'clm-width-a',to:'clm-width-b',relation:'contradicts',rationale:'Synthetic contradiction'})});
  });
  expect(r.diagnostics.candidates).toHaveLength(1);expect(r.diagnostics.candidates[0].triggering_edges).toEqual(['edg-conflict']);
  expect((r.diagnostics.candidates[0].evidence.reasons as unknown[])).toHaveLength(2);
 });
 it('ignores unreviewed contradiction edges',async()=>expect((await changed('active-claim-conflict',d=>{find(d,'edg-conflict').review_state='machine_proposed';})).diagnostics.candidates).toEqual([]));
 it('does not confuse tension with contradiction',async()=>expect((await changed('active-claim-conflict',d=>{find(d,'edg-conflict').relation='tension_with';})).diagnostics.candidates).toEqual([]));
 it.each([{scope:'other-frame'},{entity:'other-object'},{output_unit:'s'}])('does not accept mismatched calibration %o',async patch=>{
  const r=await changed('missing-calibration',(_,a)=>Object.assign(a.records.find(r=>r.kind==='calibration')!,patch),true);
  expect(r.diagnostics.candidates.map(c=>c.detector)).toEqual(['missing_calibration']);
 });
 it('rejects an inactive method as a valid calibration',async()=>expect((await changed('missing-calibration',d=>{find(d,'met-scale').status='withdrawn';},true)).diagnostics.candidates.map(c=>c.detector)).toEqual(['missing_calibration']));
 it('does not accept unreviewed calibration annotations',async()=>expect((await changed('missing-calibration',(_,a)=>{a.records.find(r=>r.kind==='calibration')!.review_state='machine_proposed';},true)).diagnostics.candidates.map(c=>c.detector)).toEqual(['missing_calibration']));
 it('does not require image calibration for physical-domain input',async()=>expect((await changed('missing-calibration',d=>{find(d,'mea-pixels').unit='mm';})).diagnostics.candidates).toEqual([]));
 it('keeps stable IDs while changing fingerprints when quantities change',async()=>{
  const before=(await run('pcb-color')).diagnostics.candidates[0],after=(await changed('pcb-color',d=>{find(d,'mea-object').value=0.5;})).diagnostics.candidates[0];
  expect(after.id).toBe(before.id);expect(after.fingerprint).not.toBe(before.fingerprint);
 });
});
describe('fail closed and review separation',()=>{
 it('rejects unsupported annotation kinds and extra fields',()=>{
  expect(auditMetadataSchema.safeParse({schema_version:1,records:[{id:'aud-nlp',review_state:'reviewed',kind:'prose_guess'}]}).success).toBe(false);
  expect(auditMetadataSchema.safeParse({schema_version:1,records:[],verify_all:true}).success).toBe(false);
 });
 it('rejects unsupported comparison operators',async()=>{await expect(changed('pcb-color',(_,a)=>{(a.records[0] as any).operator='exceeds_somehow';})).rejects.toThrow();});
 it.each(['bananas','m'])('rejects invalid comparison unit %s',async unit=>{await expect(changed('pcb-color',(_,a)=>{(a.records[0] as any).unit=unit;})).rejects.toThrow();});
 it('rejects dangling operands',async()=>{await expect(changed('pcb-color',(_,a)=>{(a.records[0] as any).left='mea-missing';})).rejects.toThrow('dangling');});
 it('rejects mismatched graph/provenance',async()=>{const a=await run('pcb-color'),b=await run('4940');expect(()=>auditGraph(a.graph,b.provenance)).toThrow('mismatch');});
 it('rejects graph tampering',async()=>{const c=await run('pcb-color');c.graph.nodes[0].summary='tampered';expect(()=>auditGraph(c.graph,c.provenance)).toThrow('integrity');});
 it('rejects missing numeric results even with regenerated transport hashes',async()=>{
  const c=await run('4940');c.graph.derivations=[];const{content_fingerprint:_,...g}=c.graph;c.graph.content_fingerprint=hash(canonical(g));
  c.provenance.graph_fingerprint=c.graph.content_fingerprint;const{content_fingerprint:__,...p}=c.provenance;c.provenance.content_fingerprint=hash(canonical(p));
  expect(()=>auditGraph(c.graph,c.provenance)).toThrow('Missing/duplicate');
 });
 it('rejects disconnected calibration or mismatched input units',async()=>{
  await expect(changed('missing-calibration',d=>{find(d,'inf-width').depends_on=['mea-pixels'];},true)).rejects.toThrow('not connected');
  await expect(changed('missing-calibration',(_,a)=>{(a.records.find(a=>a.kind==='calibration') as any).input_unit='sample';},true)).rejects.toThrow('unit mismatch');
 });
 it.each([0,NaN,Infinity])('rejects invalid calibration scale %s',async scale=>{await expect(changed('missing-calibration',(_,a)=>{(a.records.find(a=>a.kind==='calibration') as any).scale=scale;},true)).rejects.toThrow();});
 it('rejects duplicate supports and non-support group edges',async()=>{
  await expect(changed('pseudo-independent',(_,a)=>{(a.records[0] as any).edges=['edg-clahe','edg-clahe'];})).rejects.toThrow();
  await expect(changed('pseudo-independent',d=>{find(d,'edg-clahe').relation='consistent_with';})).rejects.toThrow('support edges');
 });
 it('cannot promote candidates by mutating generated status/review state',async()=>{
  const c=(await run('pcb-color')).diagnostics.candidates[0];
  expect(candidateSchema.safeParse({...c,status:'verified'}).success).toBe(false);
  expect(candidateSchema.safeParse({...c,review_state:'reviewed'}).success).toBe(false);
  expect(authoredSchema.safeParse(c).success).toBe(false);
 });
 it('requires a separate authored reviewed record to publish a verified diagnostic',async()=>{
  const{docs,audit}=await inputs('pcb-color'),candidate=(await run('pcb-color')).diagnostics.candidates[0];
  const node={id:'dgn-human-review',type:'diagnostic',title:'Authored review',summary:'Synthetic review',created_at:'2026-09-26',updated_at:'2026-09-26',tags:['synthetic'],status:'verified',review_state:'machine_proposed',diagnostic_type:'arithmetic_error',targets:['clm-exceeds'],depends_on:['mea-object','mea-shirt'],statement:'Authored review outcome.',severity:'local'};
  expect(authoredSchema.safeParse(node).success).toBe(false);
  const reviewed=authoredSchema.parse({...node,review_state:'reviewed'});docs.push({node:reviewed,path:'dgn-human-review.md',body:'',sha256:hash(canonical(reviewed))});
  const c=await compileDocuments(docs,process.cwd(),audit);
  expect(c.graph.nodes.some(n=>n.id==='dgn-human-review'&&n.status==='verified')).toBe(true);
  expect(auditGraph(c.graph,c.provenance).candidates.find(c=>c.id===candidate.id)?.status).toBe('candidate');
 });
 it('runs exactly the six authorized detectors',async()=>expect((await run('pcb-color')).diagnostics.detectors).toEqual([...detectorNames]));
});

describe('additional structural boundaries',()=>{
 it('fails closed on unsupported measurement-domain units in physical inferences',async()=>{
  await expect(changed('missing-calibration',d=>{find(d,'mea-pixels').unit='unknown_pixel_unit';})).rejects.toThrow('Unsupported unit');
 });
 it('detects two separately asserted support paths even when both reuse the same evidence node',async()=>{
  const r=await changed('pseudo-independent',d=>{find(d,'edg-false-color').from='inf-clahe';});
  expect(r.diagnostics.candidates.map(c=>c.detector)).toEqual(['pseudo_independence']);
  expect(r.diagnostics.candidates[0].triggering_edges).toContain('edg-false-color');
 });
 it('does not detect circular support after replacing the reused input with an independent literal',async()=>{
  const r=await changed('4940',d=>{find(d,'der-velocity').inputs.frequency={value:4940,unit:'Hz'};});
  expect(r.diagnostics.candidates).toEqual([]);
 });
 it('fails closed on incompatible typed values for the same quantity',async()=>{
  await expect(changed('pcb-size',(_,a)=>{(a.records[1] as any).unit='s';})).rejects.toThrow('dimension mismatch');
 });
});

describe('calibration conversion endpoint checks',()=>{
 it('does not accept the raw measurement as its own calibrated output',async()=>{
  await expect(changed('missing-calibration',(_,a)=>{(a.records.find(r=>r.kind==='calibration') as any).output='mea-pixels';},true)).rejects.toThrow('distinct raw input');
 });
 it('rejects a physical annotation that contradicts its numeric node units',async()=>{
  await expect(changed('missing-calibration',(_,a)=>{(a.records[0] as any).node='mea-pixels';})).rejects.toThrow('dimension mismatch');
 });
});
