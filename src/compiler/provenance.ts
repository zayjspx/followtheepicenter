import type { Authored } from '../schemas/nodes';
import { references } from './references';
export type Step={from:string;to:string;via:{kind:'field'|'edge'|'annotation';id:string;field:string}};
export const canonical=(value:unknown):string=>{
  if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if(value!==null && typeof value==='object') return '{'+Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
  return JSON.stringify(value);
};
export function dependencyLinks(nodes:Authored[]):Step[] {
  const links:Step[]=[];
  const add=(from:string,to:string,kind:'field'|'edge',id:string,field:string)=>links.push({from,to,via:{kind,id,field}});
  for(const n of nodes) {
    for(const r of references(n).filter(r=>r.dependency)) add(n.id,r.id,'field',n.id,r.field);
    if(n.type!=='edge') continue;
    add(n.id,n.from,'field',n.id,'from');add(n.id,n.to,'field',n.id,'to');
    const forward=['derived_from','depends_on','assumes','uses_method','computed_by','predicted_by','quotes','requires','requires_consistency_with'].includes(n.relation);
    const reverse=['supports','weakly_supports','uniquely_supports','discriminates_for','source_of','documents'].includes(n.relation);
    if(!forward && !reverse) continue;
    const downstream=forward?n.from:n.to,upstream=forward?n.to:n.from;
    add(downstream,upstream,'edge',n.id,n.relation);
    for(const ref of [...(n.depends_on??[]),...(n.receipts??[])]) add(downstream,ref,'edge',n.id,'rationale_dependency');
  }
  return [...new Map(links.map(l=>[canonical(l),l])).values()].sort((a,b)=>canonical(a)<canonical(b)?-1:1);
}
