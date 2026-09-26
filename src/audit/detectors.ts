import { quantity, convert, isPhysical } from '../compiler/arithmetic';
import { AuditContext, annotationPath, joinPaths, imageUnits, sorted, type Path } from './context';
import { supportEndpoints } from './annotations';

export function arithmeticContradiction(ctx:AuditContext) {
  for(const a of ctx.records) {
    if(a.kind!=='comparison')continue;
    const l=ctx.numeric(a.left,a.unit), r=ctx.numeric(a.right,a.unit),t=a.tolerance;
    const holds={gt:l>r+t,gte:l>=r-t,lt:l<r-t,lte:l<=r+t,eq:Math.abs(l-r)<=t,ne:Math.abs(l-r)>t}[a.operator];
    if(!ctx.active(a.claim)||holds)continue;
    ctx.emit('arithmetic_contradiction',a.id,
      [annotationPath(a.claim,a.left,a.id,'left'),annotationPath(a.claim,a.right,a.id,'right')],
      [a.id], 'The authored numeric relation does not hold: '+l+' '+a.operator+' '+r+' ('+a.unit+', tolerance '+t+').',
      {left:l,right:r,unit:a.unit,operator:a.operator,tolerance:t,relation_holds:false});
  }
}
export function circularSupport(ctx:AuditContext) {
  for(const edge of [...ctx.graph.edges].sort((a,b)=>a.id<b.id?-1:1)) {
    const ep=supportEndpoints(edge);
    if(!ep||!ctx.active(edge.id)||!ctx.active(ep.evidence)||!ctx.active(ep.target))continue;
    // Remove the proposed corroboration edge before looking for its upstream dependency.
    const dependency=ctx.path(ep.evidence,ep.target,{excludeEdge:edge.id});
    if(!dependency)continue;
    const closing={from:ep.target,to:ep.evidence,via:{kind:'edge' as const,id:edge.id,field:edge.relation}};
    const cycle={nodes:[...dependency.nodes,ep.evidence],steps:[...dependency.steps,closing]};
    ctx.emit('circular_support',edge.id,[cycle],[],
      ep.evidence+' is offered as support/prediction of '+ep.target+' but already depends on it. The path closes through '+edge.id+'.',
      {cycle:cycle.nodes,corroboration_edge:edge.id});
  }
}
export function pseudoIndependence(ctx:AuditContext) {
  for(const a of ctx.records) {
    if(a.kind!=='independence'||!ctx.active(a.claim))continue;
    const roots=new Map<string,Map<string,Path>>();
    for(const id of a.edges) {
      const edge=ctx.graph.edges.find(e=>e.id===id)!;
      const ep=supportEndpoints(edge)!;
      if(!ctx.active(edge.id)||!ctx.active(ep.evidence))continue;
      const support:Path={nodes:[a.claim,ep.evidence],steps:[{from:a.claim,to:ep.evidence,via:{kind:'edge',id:edge.id,field:edge.relation}}]};
      for(const source of ctx.graph.nodes.filter(n=>n.type==='source')) {
        // Method bibliographies and invariant references are not independent observations.
        const p=ctx.path(ep.evidence,source.id,{dataOnly:true});
        if(p) {if(!roots.has(source.id))roots.set(source.id,new Map());roots.get(source.id)!.set(edge.id,joinPaths(support,p));}
      }
    }
    const shared=[...roots.entries()].filter(([,paths])=>paths.size>=2).sort(([a],[b])=>a<b?-1:1);
    if(!shared.length)continue;
    ctx.emit('pseudo_independence',a.id,shared.flatMap(([,paths])=>[...paths.values()]),[a.id],
      'Support paths asserted as independent share preserved evidence roots. Different transforms do not establish independent observations; this is a review candidate, not a statistical dependence proof.',
      {shared_roots:shared.map(([id])=>id),groups:shared.map(([root,paths])=>({root,support_nodes:sorted([...paths.values()].map(p=>p.nodes[1])),support_edges:sorted(paths.keys())}))});
  }
}
export function assumptionLaundering(ctx:AuditContext) {
  for(const a of ctx.records) {
    if(a.kind!=='independent_support')continue;
    const edge=ctx.graph.edges.find(e=>e.id===a.edge)!;
    const ep=supportEndpoints(edge)!;
    if(!ctx.active(edge.id)||!ctx.active(ep.target)||!ctx.active(ep.evidence))continue;
    const support:Path={nodes:[ep.target,ep.evidence],steps:[{from:ep.target,to:ep.evidence,via:{kind:'edge',id:edge.id,field:edge.relation}}]};
    const taints=ctx.graph.nodes.filter(n=>n.type==='assumption'||n.type==='derivation').map(n=>({n,p:ctx.path(ep.evidence,n.id,{excludeEdge:edge.id})})).filter(x=>x.p);
    if(!taints.length)continue;
    ctx.emit('assumption_laundering',a.id,taints.map(x=>joinPaths(support,x.p!)),[a.id],
      'Support explicitly represented as independently measured has an assumption or derivation in its ancestry. Review the claimed independence; ancestry is not itself a finding that the value is false.',
      {independent_support_edge:edge.id,origins:sorted(taints.map(x=>x.n.id))});
  }
}
export function missingCalibration(ctx:AuditContext) {
  const calibrations=ctx.records.filter(a=>a.kind==='calibration');
  for(const c of calibrations) {
    if(!imageUnits.has(c.input_unit))throw new Error('Unsupported calibration input domain: '+c.id);
    const input=ctx.node(c.input);
    if(input.type!=='measurement'||input.unit!==c.input_unit)throw new Error('Calibration input unit mismatch: '+c.id);
    if(c.input===c.output)throw new Error('Calibration requires distinct raw input and converted output: '+c.id);
    const output=ctx.node(c.output);
    if(output.type==='measurement')convert(quantity(1,output.unit),c.output_unit);
    if(output.type==='derivation')convert(quantity(1,output.output.unit),c.output_unit);
    const physical=quantity(1,c.output_unit);
    if(!isPhysical(physical))throw new Error('Calibration output must be physical: '+c.id);
    if(!ctx.path(c.output,c.input)||!ctx.path(c.output,c.method))throw new Error('Calibration is not connected to output/input/method: '+c.id);
  }
  for(const a of ctx.records) {
    if(a.kind!=='physical_quantity')continue;
    const declared=ctx.node(a.node);
    if(declared.type==='measurement')convert(quantity(1,declared.unit),a.unit);
    if(declared.type==='derivation')convert(quantity(1,declared.output.unit),a.unit);
    const u=quantity(1,a.unit);
    if(!isPhysical(u))throw new Error('Physical output requires a physical unit: '+a.id);
    if(!ctx.active(a.node))continue;
    for (const n of ctx.graph.nodes) if (n.type==='measurement' && ctx.path(a.node,n.id,{dataOnly:true}) && !imageUnits.has(n.unit)) quantity(n.value,n.unit);
    const raw=ctx.graph.nodes.filter(n=>n.type==='measurement'&&imageUnits.has(n.unit));
    const missing:{input:string;path:Path}[]=[];
    for(const n of raw) {
      const p=ctx.path(a.node,n.id,{dataOnly:true});
      if(!p)continue;
      const valid=calibrations.some(c=>{
        if(c.input!==n.id||c.entity!==a.entity||c.scope!==a.scope||!ctx.active(c.method)||!ctx.active(c.output))return false;
        // A reviewed, connected conversion must sit on this output's dependency chain.
        if(!ctx.path(a.node,c.output)||!ctx.path(c.output,n.id))return false;
        try { convert(quantity(1,c.output_unit),a.unit); return true; } catch { return false; }
      });
      if(!valid)missing.push({input:n.id,path:p});
    }
    if(!missing.length)continue;
    ctx.emit('missing_calibration',a.id,missing.map(m=>m.path),[a.id,...calibrations.filter(c=>missing.some(m=>m.input===c.input)).map(c=>c.id)],
      'A declared physical quantity depends on image/audio-domain measurements without a connected, active, reviewed calibration matching the input, entity, scope and output dimensions.',
      {output:a.node,entity:a.entity,scope:a.scope,unit:a.unit,uncalibrated_inputs:sorted(missing.map(m=>m.input))});
  }
}
export function activeClaimConflict(ctx:AuditContext) {
  type Conflict={paths:Path[];annotations:string[];edges:string[];reasons:unknown[]};
  const conflicts=new Map<string,Conflict>();
  const add=(a:string,b:string,path:Path[],annotations:string[],edges:string[],reason:unknown)=>{
    if(a===b)throw new Error('Claim conflict requires distinct claims');
    const key=[a,b].sort().join('|'),c=conflicts.get(key)??{paths:[],annotations:[],edges:[],reasons:[]};
    c.paths.push(...path);c.annotations.push(...annotations);c.edges.push(...edges);c.reasons.push(reason);conflicts.set(key,c);
  };
  for(const e of [...ctx.graph.edges].sort((a,b)=>a.id<b.id?-1:1)) {
    if(e.relation!=='contradicts'||!ctx.active(e.id)||!ctx.active(e.from)||!ctx.active(e.to))continue;
    if(ctx.node(e.from).type!=='claim'||ctx.node(e.to).type!=='claim')continue;
    add(e.from,e.to,[{nodes:[e.from,e.to],steps:[{from:e.from,to:e.to,via:{kind:'edge',id:e.id,field:'contradicts'}}]}],[],[e.id],{contradiction_edge:e.id});
  }
  const values=ctx.records.filter(a=>a.kind==='typed_value');
  for(const a of values) { quantity(a.value,a.unit);quantity(a.tolerance,a.unit); }
  for(let i=0;i<values.length;i++) for(let j=i+1;j<values.length;j++) {
    const a=values[i],b=values[j];
    if(a.claim===b.claim||!ctx.active(a.claim)||!ctx.active(b.claim)||a.entity!==b.entity||a.quantity!==b.quantity||a.scope!==b.scope)continue;
    const bv=convert(quantity(b.value,b.unit),a.unit),bt=convert(quantity(b.tolerance,b.unit),a.unit);
    if(Math.abs(a.value-bv)<=a.tolerance+bt)continue;
    add(a.claim,b.claim,[{nodes:[a.claim],steps:[]},{nodes:[b.claim],steps:[]}],[a.id,b.id],[],
      {entity:a.entity,quantity:a.quantity,scope:a.scope,unit:a.unit,left:{claim:a.claim,value:a.value,tolerance:a.tolerance},right:{claim:b.claim,value:bv,tolerance:bt},intervals_overlap:false});
  }
  for(const [key,c] of [...conflicts.entries()].sort(([a],[b])=>a<b?-1:1))
    ctx.emit('active_claim_conflict',key,c.paths,c.annotations,
      'Reviewed active claims have an explicit reviewed contradiction relation or disjoint typed value intervals for the same defined entity, quantity and scope. No prose contradiction was inferred.',
      {reasons:c.reasons},c.edges);
}
