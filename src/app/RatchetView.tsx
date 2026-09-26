import type {DataBundle,NodeRecord} from './types';
import {indexBundle} from './data';
import {Empty,NodeLink,Section,StateBadge,TypeBadge} from './ui';
import {href} from './router';

const responseOrder=['yes','no','qualify','unknown','withdraw','non_answer','tangent'];
function RefList({ids,bundle}:{ids:string[]|undefined;bundle:DataBundle}){const {nodes}=indexBundle(bundle);if(!ids?.length)return <Empty/>;return <div className="ref-list">{ids.map(id=>nodes.get(id)?<NodeLink key={id} node={nodes.get(id)!}/>:<span key={id}>{id}</span>)}</div>}
export function RatchetsIndex({bundle}:{bundle:DataBundle}){
 const {nodes}=indexBundle(bundle); const ordered=bundle.order.baseline_order;
 return <main className="page"><header className="page-head"><p className="kicker">Technical view</p><h1>Branching proof obligations</h1><p className="lede">Ratchets are the authored branch graphs underneath the self-guided experience. The order below is structural: downstream reach, reviewed diagnostics, trigger breadth, and convergence burdens. It is not a truth score or debate ranking.</p><div className="button-row"><a className="button" href={href('/guided')}>Open self-guided view</a></div></header><div className="card-list">{ordered.map((o:any)=>{const r=nodes.get(o.ratchet);if(!r)return null;return <a className="ratchet-card" href={href(`/ratchet/${r.id}`)} key={r.id}><span className="position">{o.position}</span><div><TypeBadge type="ratchet"/><h2>{r.title}</h2><p>{r.summary}</p><div className="meta-row"><span>{o.targets.length} targets</span><span>{o.convergence_burdens.length} convergence burdens</span><span>{o.downstream_claim_count} downstream claims</span></div></div></a>})}</div></main>
}
export function RatchetView({id,bundle}:{id:string;bundle:DataBundle}){
 const {nodes}=indexBundle(bundle); const r=nodes.get(id); if(!r||r.type!=='ratchet')return <main className="page"><Section title="Ratchet not found"><p>{id}</p></Section></main>;
 const topo=bundle.topology.ratchets[id]??{}; const locks=(r.locks??[]).map((x:string)=>nodes.get(x)).filter(Boolean) as NodeRecord[];
 const order=bundle.order.baseline_order.find((x:any)=>x.ratchet===id);
 return <main className="page"><header className="detail-hero"><div className="eyebrow"><TypeBadge type="ratchet"/><StateBadge>{r.status}</StateBadge>{order&&<StateBadge tone="good">structural order #{order.position}</StateBadge>}</div><h1>{r.title}</h1><p className="lede">{r.summary}</p><div className="button-row"><a className="button" href={href(`/guided/${r.id}`)}>Walk this ratchet</a></div><p className="mono idline">{r.id}</p></header>
 <div className="three-col"><Section title="Convergence burden"><RefList ids={r.convergence_burdens} bundle={bundle}/></Section><Section title="Activated by"><RefList ids={topo.activated_by} bundle={bundle}/></Section><Section title="Callbacks"><RefList ids={topo.cross_ratchet_callbacks} bundle={bundle}/></Section></div>
 <Section title="Simple flow"><div className="lock-stack">{locks.map((l,i)=><article className={`lock-card ${l.id===r.entry_lock?'entry':''}`} key={l.id}><div className="lock-index">{i+1}</div><div className="lock-main"><div className="eyebrow"><TypeBadge type="lock"/>{l.id===r.entry_lock&&<StateBadge tone="good">entry</StateBadge>}</div><h3>{l.title}</h3><p className="question">{l.question}</p><div className="branch-grid">{responseOrder.map(k=><a key={k} className="branch" href={href(`/node/${l.branches[k]}`)}><span>{k.replace('_',' ')}</span><strong>{nodes.get(l.branches[k])?.title??l.branches[k]}</strong></a>)}</div></div></article>)}</div></Section>
 <div className="two-col panels"><Section title="Targets"><RefList ids={topo.targets} bundle={bundle}/></Section><Section title="Response patterns handled"><RefList ids={topo.blocked_response_patterns} bundle={bundle}/></Section></div>
 <Section title="Closure states"><div className="chip-row">{(r.closure_states??[]).map((x:string)=><span className="chip" key={x}>{x.replaceAll('_',' ')}</span>)}</div><p className="footnote">A ratchet resolves burdens; it does not score people or declare a debate winner.</p></Section>
 </main>
}
