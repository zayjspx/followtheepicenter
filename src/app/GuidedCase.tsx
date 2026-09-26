import {useEffect,useMemo,useState} from 'react';
import type {DataBundle,NodeRecord} from './types';
import {indexBundle} from './data';
import {href,go} from './router';
import {Empty,NodeLink,Section,StateBadge,TypeBadge} from './ui';
import {GUIDED_RESPONSES,guidedDomain,guidedResponseLabels,guidedResponseShort,impactForResponse,primaryClaimsForRatchet,reviewedDiagnosticsForTargets,type GuidedResponse} from '../guided/runtime';

type TrailItem={lock_id:string;response:GuidedResponse;next_lock_id?:string};
type Saved={lock_id:string;trail:TrailItem[];mode:'simple'|'technical'};

const storageKey=(id:string)=>`debunker.guided.v1:${id}`;
function loadSaved(id:string):Saved|undefined{try{const raw=localStorage.getItem(storageKey(id));return raw?JSON.parse(raw):undefined}catch{return undefined}}
function save(id:string,s:Saved){try{localStorage.setItem(storageKey(id),JSON.stringify(s))}catch{}}
function clear(id:string){try{localStorage.removeItem(storageKey(id))}catch{}}
function RefList({ids,bundle}:{ids:string[]|undefined;bundle:DataBundle}){const {nodes}=indexBundle(bundle);if(!ids?.length)return <Empty/>;return <div className="ref-list">{ids.map(id=>nodes.get(id)?<NodeLink key={id} node={nodes.get(id)!}/>:<code key={id}>{id}</code>)}</div>}
function statement(n:NodeRecord){return n.statement??n.question??n.summary??n.title??n.id}

export function GuidedIndex({bundle}:{bundle:DataBundle}){
  const {nodes}=indexBundle(bundle); const [q,setQ]=useState('');
  const order=new Map(bundle.order.baseline_order.map((x:any)=>[x.ratchet,x.position]));
  const ratchets=bundle.graph.nodes.filter(n=>n.type==='ratchet').filter(r=>{
    const targets=primaryClaimsForRatchet(bundle,r.id);const hay=`${r.title} ${r.summary} ${r.tags?.join(' ')} ${targets.map(statement).join(' ')}`.toLowerCase();return !q.trim()||hay.includes(q.toLowerCase());
  }).sort((a,b)=>(order.get(a.id)??999)-(order.get(b.id)??999));
  const groups=new Map<string,NodeRecord[]>();for(const r of ratchets){const d=guidedDomain(r);(groups.get(d)??groups.set(d,[]).get(d)!).push(r)}
  const grouped=[...groups.entries()];
  return <main className="page guided-index"><header className="page-head guided-head"><p className="kicker">Self-guided Debunker</p><h1>Pick a claim. Follow the reasoning.</h1><p className="lede">You do not have to accept the site's criticism. Choose the strongest answer at each step and see what burden, evidence, or dependency comes next. The canonical case graph never changes when you explore.</p><div className="guided-principles"><span>Source-first</span><span>Branch both ways</span><span>No truth score</span><span>Permanent permalinks</span></div></header>
  <section className="guided-callout"><div><strong>How it works</strong><p>Each walkthrough begins with an attributed claim, shows the preserved record, asks one narrow question, then follows whichever response you choose. At every step you can see what that response changes and what support still survives.</p></div><a className="button button-ghost" href={href('/claims')}>Browse all claims</a></section>
  <input className="big-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Find a claim or guided examination…"/>
  {grouped.map(([domain,rows])=><section className="guided-group" key={domain}><div className="guided-group-head"><h2>{domain}</h2><span>{rows.length} walkthrough{rows.length===1?'':'s'}</span></div><div className="guided-card-grid">{rows.map(r=>{const targets=primaryClaimsForRatchet(bundle,r.id);const saved=loadSaved(r.id);const entry=nodes.get(r.entry_lock);return <a className="guided-card" href={href(`/guided/${r.id}`,saved?.lock_id?{lock:saved.lock_id}:undefined)} key={r.id}><div className="eyebrow"><TypeBadge type="ratchet"/>{saved&&<StateBadge tone="good">resume</StateBadge>}</div><h3>{r.title}</h3><p>{r.summary}</p><div className="guided-targets">{targets.slice(0,2).map(c=><span key={c.id}>{c.title}</span>)}</div><div className="guided-card-foot"><span>{(r.locks??[]).length} questions</span><strong>{saved?'Resume':'Start'} →</strong></div>{entry&&<small>Starts: {entry.question}</small>}</a>})}</div></section>)}
  </main>
}

export function GuidedCase({id,bundle,initialLock}:{id:string;bundle:DataBundle;initialLock?:string}){
  const {nodes}=indexBundle(bundle); const ratchet=nodes.get(id);
  if(!ratchet||ratchet.type!=='ratchet')return <main className="page"><Section title="Guided examination not found"><p>{id}</p></Section></main>;
  const saved=useMemo(()=>loadSaved(id),[id]);
  const validInitial=initialLock&&ratchet.locks?.includes(initialLock)?initialLock:undefined;
  const [lockId,setLockId]=useState(validInitial??saved?.lock_id??ratchet.entry_lock);
  const [trail,setTrail]=useState<TrailItem[]>(validInitial&&validInitial!==saved?.lock_id?[]:saved?.trail??[]);
  const [mode,setMode]=useState<'simple'|'technical'>(saved?.mode??'simple');
  const [selected,setSelected]=useState<GuidedResponse|undefined>();
  const lock=nodes.get(lockId); const topo=bundle.topology.ratchets[id]??{}; const targets=((lock?.targets??[]) as string[]).filter(x=>nodes.get(x)?.type==='claim');
  const claims=targets.map(x=>nodes.get(x)!).filter(Boolean); const burdens=((lock?.burdens??[]) as string[]).map(x=>nodes.get(x)).filter(Boolean) as NodeRecord[];
  const receipts=((lock?.receipts??[]) as string[]).map(x=>nodes.get(x)).filter(Boolean) as NodeRecord[]; const impact=selected&&lock?impactForResponse(bundle,lock.id,selected):undefined;
  const diagnostics=reviewedDiagnosticsForTargets(bundle,targets);
  useEffect(()=>{save(id,{lock_id:lockId,trail,mode})},[id,lockId,trail,mode]);
  useEffect(()=>{if(validInitial&&lockId!==validInitial){setLockId(validInitial);setSelected(undefined)}},[validInitial]);
  if(!lock||lock.type!=='lock')return <main className="page"><Section title="Lock unavailable"><p>{lockId}</p></Section></main>;
  const progress=Math.max(1,(ratchet.locks??[]).indexOf(lockId)+1),total=(ratchet.locks??[]).length;
  const choose=(r:GuidedResponse)=>setSelected(r);
  const next=()=>{if(!impact?.next_lock_id||!nodes.get(impact.next_lock_id)){return}const item={lock_id:lockId,response:impact.response,next_lock_id:impact.next_lock_id};setTrail(t=>[...t,item]);setSelected(undefined);setLockId(impact.next_lock_id!);go(`/guided/${id}`,{lock:impact.next_lock_id})};
  const back=()=>{const prev=trail.at(-1);if(!prev)return;setTrail(t=>t.slice(0,-1));setSelected(undefined);setLockId(prev.lock_id);go(`/guided/${id}`,{lock:prev.lock_id})};
  const reset=()=>{clear(id);setTrail([]);setSelected(undefined);setLockId(ratchet.entry_lock);go(`/guided/${id}`,{lock:ratchet.entry_lock})};
  const copy=async()=>{const u=new URL(location.href);u.hash=href(`/guided/${id}`,{lock:lockId}).slice(1);try{await navigator.clipboard.writeText(u.toString())}catch{}};
  const downstream=targets.flatMap(t=>(bundle.blast.records[t]?.downstream_claims??[]) as string[]); const supports=targets.flatMap(t=>(bundle.topology.claim_state[t]?.support_paths??[]) as string[]);
  return <main className="page guided-case"><header className="guided-case-header"><div className="guided-breadcrumb"><a href={href('/guided')}>Guided case</a><span>›</span><span>{guidedDomain(ratchet)}</span></div><div className="eyebrow"><TypeBadge type="ratchet"/><StateBadge tone="good">self-guided</StateBadge></div><h1>{ratchet.title}</h1><p className="lede">{ratchet.summary}</p><div className="guided-toolbar"><div className="segmented"><button className={mode==='simple'?'active':''} onClick={()=>setMode('simple')}>Simple</button><button className={mode==='technical'?'active':''} onClick={()=>setMode('technical')}>Technical</button></div><button className="button button-ghost" onClick={copy}>Copy this step</button><a className="button button-ghost" href={href(`/ratchet/${id}`)}>Full ratchet</a><button className="button button-ghost" onClick={reset}>Reset</button></div></header>
  <div className="guided-progress"><div style={{width:`${Math.min(100,(progress/Math.max(total,1))*100)}%`}}/><span>Question {progress} of {total} in authored ratchet · branch paths may revisit a question</span></div>
  {claims.length>0&&<section className="guided-claim-box"><p className="guided-label">Claim under examination</p>{claims.map(c=><div key={c.id}><h2>{c.title}</h2><p>{c.statement}</p><NodeLink node={c}>Open claim record</NodeLink></div>)}</section>}
  <section className="guided-question-card"><div className="guided-label">One question</div><h2>{lock.question}</h2>{burdens.length>0&&<div className="why-matters"><strong>Why this matters</strong>{burdens.map(b=><p key={b.id}>{b.statement??b.summary}</p>)}</div>}
    {receipts.length>0&&<div className="guided-evidence"><div className="guided-label">Record on the table</div>{receipts.map(r=><article key={r.id}>{r.quote&&<blockquote>“{r.quote}”</blockquote>}<div><NodeLink node={r}>{r.title}</NodeLink>{r.context&&<p>{r.context}</p>}</div></article>)}</div>}
    <div className="guided-response-intro"><strong>Choose the strongest response to explore.</strong><span>You are not voting true/false; you are choosing the next branch of the argument.</span></div>
    <div className="guided-response-grid">{GUIDED_RESPONSES.map(r=><button key={r} className={`guided-response ${selected===r?'selected':''}`} onClick={()=>choose(r)}><strong>{guidedResponseLabels[r]}</strong><span>{lock.branches?.[r]===lock.id?'stays on this burden':nodes.get(lock.branches?.[r])?.title??'branch unavailable'}</span></button>)}</div>
  </section>
  {impact&&<section className="guided-impact"><div className="guided-label">What this answer changes</div><h2>{impact.effect_title}</h2><p className="impact-lede">{impact.effect_text}</p><div className="impact-grid"><div><strong>Downstream review</strong><span>{impact.downstream_claims.length} downstream claim{impact.downstream_claims.length===1?'':'s'} structurally reachable</span></div><div><strong>Open obligations</strong><span>{impact.open_burdens.length} burden{impact.open_burdens.length===1?'':'s'} remain visible</span></div><div><strong>Other support</strong><span>{impact.support_paths.length} current support path{impact.support_paths.length===1?'':'s'} remain in the canonical graph</span></div></div><p className="guided-caution">{impact.note}</p>
    <div className="guided-next"><div><span className="guided-label">Next</span><strong>{nodes.get(impact.next_lock_id??'')?.question??(impact.next_lock_id===lock.id?'Return to the same burden':'No authored next Lock')}</strong></div><button className="button" onClick={next} disabled={!impact.next_lock_id||!nodes.get(impact.next_lock_id)}>Continue →</button></div>
  </section>}
  <div className="two-col guided-support-grid"><Section title="What still survives"><p className="muted">A challenged inference does not erase independent support. These are the current authored support paths for the target claim(s).</p><RefList ids={[...new Set(supports)]} bundle={bundle}/>{downstream.length>0&&<><h3>Claims downstream</h3><RefList ids={[...new Set(downstream)]} bundle={bundle}/></>}</Section><Section title="Reviewed issues"><p className="muted">Reviewed structural diagnostics that touch the claim(s) at this step.</p>{diagnostics.length?<div className="guided-diagnostic-list">{diagnostics.map(d=><NodeLink key={d.id} node={d}><span>{d.title}</span></NodeLink>)}</div>:<Empty>None attached to this step.</Empty>}</Section></div>
  {mode==='technical'&&<><div className="three-col guided-tech"><Section title="Targets"><RefList ids={targets} bundle={bundle}/></Section><Section title="Burden stack"><RefList ids={impact?.open_burdens??((lock.burdens??[]) as string[])} bundle={bundle}/></Section><Section title="Cross-ratchet callbacks"><RefList ids={topo.cross_ratchet_callbacks} bundle={bundle}/></Section></div><Section title="Technical graph tools"><div className="button-row"><a className="button button-ghost" href={href('/graph',{focus:targets[0]??lock.id,depth:2})}>Open dependency graph</a>{targets.map(t=><a key={t} className="button button-ghost" href={href(`/claim/${t}`)}>Full claim record</a>)}</div><p className="mono idline">ratchet {id} · lock {lockId}</p></Section></>}
  <section className="guided-history"><div className="panel-head"><h2>Your path</h2><span className="count">{trail.length}</span></div>{trail.length?<ol>{trail.map((x,i)=><li key={`${x.lock_id}-${i}`}><button onClick={()=>{setTrail(trail.slice(0,i));setSelected(undefined);setLockId(x.lock_id);go(`/guided/${id}`,{lock:x.lock_id})}}>{nodes.get(x.lock_id)?.question}</button><span>{guidedResponseShort[x.response]}</span></li>)}</ol>:<p className="muted">No branches taken yet.</p>}<div className="button-row"><button className="button button-ghost" disabled={!trail.length} onClick={back}>← Back one branch</button></div></section>
  </main>
}
