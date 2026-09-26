import type {ReactNode} from 'react';
import {href} from './router';
import type {NodeRecord} from './types';

export const typeLabels:Record<string,string>={claim:'Claim',receipt:'Receipt',source:'Source',observation:'Observation',measurement:'Measurement',assumption:'Assumption',invariant:'Invariant',method:'Method',derivation:'Derivation',inference:'Inference',burden:'Burden',diagnostic:'Diagnostic',escape:'Response pattern',lock:'Lock',ratchet:'Ratchet',theory:'Theory',session:'Session'};
export function nodePath(n:NodeRecord|string,type?:string){
  if(typeof n==='string') return `/${type??'node'}/${n}`;
  if(n.type==='ratchet') return `/ratchet/${n.id}`;
  if(n.type==='claim') return `/claim/${n.id}`;
  if(n.type==='receipt') return `/receipt/${n.id}`;
  if(n.type==='source') return `/source/${n.id}`;
  return `/node/${n.id}`;
}
export function NodeLink({node,children,className=''}:{node:NodeRecord;children?:ReactNode;className?:string}){
  return <a className={`node-link ${className}`} href={href(nodePath(node))}>{children??node.title??node.id}</a>;
}
export function TypeBadge({type}:{type:string}){return <span className={`badge badge-${type}`}>{typeLabels[type]??type}</span>}
export function StateBadge({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`state state-${tone}`}>{children}</span>}
export function Empty({children='None recorded.'}:{children?:ReactNode}){return <p className="muted empty">{children}</p>}
export function Section({title,children,aside}:{title:string;children:ReactNode;aside?:ReactNode}){return <section className="panel"><div className="panel-head"><h2>{title}</h2>{aside}</div>{children}</section>}
export function CopyLinkButton(){
  const copy=async()=>{try{await navigator.clipboard.writeText(location.href)}catch{/* clipboard may be denied */}};
  return <button className="button button-ghost" onClick={copy}>Copy permalink</button>;
}
export function Truncate({children,max=78}:{children:string;max?:number}){return <>{children.length>max?children.slice(0,max-1)+'…':children}</>}
