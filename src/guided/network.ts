import type {DataBundle} from '../app/types';
import type {GuidedResponse} from './runtime';

export type WalkEvent = {kind:'answer';lock:string;ratchet:string;response:GuidedResponse}|{kind:'withhold'|'restore';node:string}|{kind:'note'|'hypothesis';text:string;lock?:string}|{kind:'resolve';node:string;text:string};
export type Walk = {build:string;events:WalkEvent[]};
export function validWalk(value:unknown,bundle:DataBundle):value is Walk {
 const w=value as Walk; if(!w||w.build!==bundle.graph.build_id||!Array.isArray(w.events)||w.events.length>5000)return false;
 const nodes=new Map(bundle.graph.nodes.map(n=>[n.id,n]));
 return w.events.every(e=>{
  if(!e||typeof e!=='object')return false;
  if(e.kind==='answer')return nodes.get(e.lock)?.type==='lock'&&nodes.get(e.ratchet)?.type==='ratchet'&&nodes.get(e.ratchet)?.locks?.includes(e.lock)&&['yes','no','qualify','unknown','withdraw','non_answer','tangent'].includes(e.response);
  if(e.kind==='withhold'||e.kind==='restore')return nodes.has(e.node);
  if(e.kind==='note'||e.kind==='hypothesis')return typeof e.text==='string'&&e.text.length<=4000;
  return e.kind==='resolve'&&nodes.get(e.node)?.type==='burden'&&typeof e.text==='string'&&e.text.trim().length>0&&e.text.length<=4000;
 });
}

// Conservative structural simulation. A affected path is not a truth verdict,
// nor an assertion that alternative support is independent or sufficient.
export function projectWalk(bundle:DataBundle,events:WalkEvent[]){
 const nodes=new Map(bundle.graph.nodes.map(n=>[n.id,n]));
 const withheld=new Set<string>(),burdens=new Set<string>(),resolved=new Map<string,string>();
 const answers=new Map<string,GuidedResponse>();const callbacks:string[]=[];
 for(const e of events){
  if(e.kind==='withhold')withheld.add(e.node);
  if(e.kind==='restore')withheld.delete(e.node);
  if(e.kind==='resolve')resolved.set(e.node,e.text);
  if(e.kind==='answer'){
   const lock=nodes.get(e.lock);for(const id of lock?.burdens??[])burdens.add(id);for(const target of lock?.targets??[])for(const id of bundle.topology.claim_state[target]?.all_burdens??[])burdens.add(id);
   const previous=answers.get(e.lock);
   if(previous&&previous!==e.response&&e.response!=='tangent')callbacks.push(`Revisited “${lock?.title}”: ${previous.replaceAll('_',' ')} → ${e.response.replaceAll('_',' ')}. The earlier answer remains in your trail.`);
   if(e.response!=='tangent')answers.set(e.lock,e.response);
  }
 }
 const reverse=new Map<string,string[]>();
 for(const [id,p] of Object.entries(bundle.provenance.nodes))for(const dep of p.direct??[]){if(nodes.has(id)&&nodes.has(dep)){const list=reverse.get(dep)??[];list.push(id);reverse.set(dep,list)}}
 const paths=new Map<string,string[]>();const queue=[...withheld].sort();for(const id of queue)paths.set(id,[id]);
 for(let i=0;i<queue.length;i++)for(const dependent of (reverse.get(queue[i])??[]).sort())if(!paths.has(dependent)){paths.set(dependent,[...paths.get(queue[i])!,dependent]);queue.push(dependent)}
 const support=new Map<string,{intact:string[];affected:string[]}>();
 for(const [id,state] of Object.entries(bundle.topology.claim_state)){
  const all=(state.support_paths??[]) as string[];
  support.set(id,{intact:all.filter(x=>!paths.has(x)),affected:all.filter(x=>paths.has(x))});
 }
 return {withheld,paths,support,burdens,resolved,answers,callbacks,hypotheses:events.filter(e=>e.kind==='hypothesis')};
}

export type NetworkLink={id:string;from:string;to:string;label:string;kind:'semantic'|'provenance'|'reference'|'branch'};
export function networkLinks(bundle:DataBundle):NetworkLink[]{
 const links:NetworkLink[]=bundle.graph.edges.map(e=>({id:e.id,from:e.from,to:e.to,label:e.relation,kind:'semantic'}));
 bundle.provenance.links.forEach((p,i)=>{if(p.via?.kind!=='edge')links.push({id:'provenance-'+i,from:p.from,to:p.to,label:p.via?.field??'dependency',kind:'provenance'})});
 for(const lock of bundle.graph.nodes.filter(n=>n.type==='lock'))for(const [response,to] of Object.entries(lock.branches??{}))links.push({id:`branch-${lock.id}-${response}`,from:lock.id,to:String(to),label:response,kind:'branch'});
 for(const n of bundle.graph.nodes.filter(n=>['lock','ratchet'].includes(n.type)))for(const field of ['targets','burdens','receipts','locks','convergence'])for(const id of n[field]??[])links.push({id:`reference-${n.id}-${field}-${id}`,from:n.id,to:id,label:field,kind:'reference'});
 return links;
}

export function networkLayout(bundle:DataBundle,links:NetworkLink[]){
 const ordered=[...bundle.graph.nodes].sort((a,b)=>a.id.localeCompare(b.id));
 const clusters=['pcb','4940','itd','blood','device','optical-flow','meta'];
 const points=ordered.map((n,i)=>{const c=Math.max(0,clusters.findIndex(t=>(n.tags??[]).includes(t)));const angle=c*Math.PI*2/7;const a=i*2.39996;return {id:n.id,x:600+Math.cos(angle)*270+Math.cos(a)*100,y:430+Math.sin(angle)*230+Math.sin(a)*100,vx:0,vy:0}});
 const index=new Map(points.map(p=>[p.id,p]));
 const springs=links.filter(l=>l.from!==l.to&&index.has(l.from)&&index.has(l.to));
 for(let step=0;step<170;step++){
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j];const dx=a.x-b.x,dy=a.y-b.y,d2=Math.max(25,dx*dx+dy*dy);const f=90/d2;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f}
  for(const l of springs){const a=index.get(l.from)!,b=index.get(l.to)!;const dx=b.x-a.x,dy=b.y-a.y;const d=Math.max(1,Math.hypot(dx,dy));const f=(d-65)*.035;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f}
  for(const p of points){p.vx+=(600-p.x)*.002;p.vy+=(430-p.y)*.002;p.x+=Math.max(-8,Math.min(8,p.vx))*.7;p.y+=Math.max(-8,Math.min(8,p.vy))*.7;p.vx*=.65;p.vy*=.65}
 }
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
 return Object.fromEntries(points.map(p=>[p.id,{x:140+(p.x-minX)/Math.max(1,maxX-minX)*920,y:100+(p.y-minY)/Math.max(1,maxY-minY)*640}]));
}
