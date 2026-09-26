import type {DataBundle,NodeRecord} from './types';
import {indexBundle} from './data';
import {Empty,NodeLink,Section,StateBadge,TypeBadge,CopyLinkButton} from './ui';
import {href} from './router';
import {ratchetsForClaim} from '../guided/runtime';

function locatorText(locator:any){
  if(!locator) return '';
  switch(locator.kind){
    case 'lines': return `Lines ${locator.start}–${locator.end}`;
    case 'page': return `Page ${locator.page}${locator.paragraph?`, paragraph ${locator.paragraph}`:''}`;
    case 'paragraph': return `Paragraph ${locator.paragraph}`;
    case 'frame': return `Frame ${locator.frame}`;
    case 'tweet': return `Tweet ${locator.tweet_id}`;
    case 'timestamp': return `${locator.start_seconds}s–${locator.end_seconds}s`;
    case 'image_region': return `Image region ${locator.x},${locator.y} ${locator.width}×${locator.height} ${locator.unit}`;
    default:return locator.kind??'';
  }
}
function assetUrl(source:any){
  if(!source?.artifact) return undefined;
  if(/^https:\/\//.test(source.artifact)) return source.artifact;
  const rel=String(source.artifact).replace(/^public\//,'');
  return new URL(rel,document.baseURI).toString();
}
function RefList({ids,bundle}:{ids:string[]|undefined;bundle:DataBundle}){
  if(!ids?.length) return <Empty/>;
  const {nodes}=indexBundle(bundle);
  return <div className="ref-list">{ids.map(id=>{const n=nodes.get(id);return n?<NodeLink key={id} node={n}/>:<span key={id} className="missing-ref">{id}</span>})}</div>
}
function KeyFacts({node}:{node:NodeRecord}){
  const rows:Array<[string,string]> = [];
  const add=(k:string,v:any)=>{if(v!==undefined&&v!==null&&v!==''&&!Array.isArray(v)&&typeof v!=='object')rows.push([k,String(v)])};
  add('Status',node.status); add('Review',node.review_state); add('Epistemic state',node.epistemic_state); add('Asserted by',node.asserted_by);
  if(node.value!==undefined) add('Value',`${node.value} ${node.unit??''}`.trim());
  add('Quantity',node.quantity); add('Basis',node.basis); add('Diagnostic type',node.diagnostic_type); add('Severity',node.severity); add('Pattern',node.pattern);
  if(!rows.length)return null;
  return <dl className="facts">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v.replaceAll('_',' ')}</dd></div>)}</dl>
}
function ReceiptView({node,bundle}:{node:NodeRecord;bundle:DataBundle}){
  const {nodes}=indexBundle(bundle); const source=nodes.get(node.source);
  return <>
    {node.quote&&<blockquote className="receipt-quote">“{node.quote}”</blockquote>}
    <p className="lede">{node.context}</p>
    <Section title="Source"><div className="source-card">{source?<><NodeLink node={source}/><p className="muted">{source.summary}</p><p className="mono small">{locatorText(node.locator)}</p>{assetUrl(source)&&<a className="button button-ghost" href={assetUrl(source)} target="_blank" rel="noreferrer">Open preserved artifact</a>}</>:<Empty/>}</div></Section>
  </>
}
function SourceView({node}:{node:NodeRecord}){
  const local=assetUrl(node);
  return <Section title="Preservation"><dl className="facts wide"><div><dt>Captured</dt><dd>{node.captured_at}</dd></div><div><dt>Published</dt><dd>{node.published_at??'Unknown'}</dd></div><div><dt>Redistribution</dt><dd>{node.redistribution}</dd></div><div><dt>SHA-256</dt><dd className="mono hash">{node.sha256}</dd></div></dl><div className="button-row">{local&&<a className="button" href={local} target="_blank" rel="noreferrer">Preserved artifact</a>}{node.original_url&&<a className="button button-ghost" href={node.original_url} target="_blank" rel="noreferrer">Original URL</a>}</div></Section>
}
function DerivationView({node,bundle}:{node:NodeRecord;bundle:DataBundle}){
  const result=bundle.graph.derivations.find(d=>d.id===node.id);
  const refs=Object.entries(node.inputs??{}).flatMap(([,v]:any)=>v.node?[v.node]:[]);
  return <Section title="Executable derivation"><div className="formula">{node.expression}</div><p>{result?<><strong>{result.value}</strong> {result.unit}</>:<>Expected {node.expected?.value} ± {node.expected?.tolerance} {node.output?.unit}</>}</p><h3>Inputs</h3><RefList ids={refs} bundle={bundle}/></Section>
}
export function NodeView({id,bundle}:{id:string;bundle:DataBundle}){
  const {nodes,incoming,outgoing}=indexBundle(bundle); const node=nodes.get(id);
  if(!node)return <main className="page"><Section title="Not found"><p>No published node named <code>{id}</code>.</p></Section></main>;
  const prov=bundle.provenance.nodes[id]; const blast=bundle.blast.records[id]??{}; const topo=node.type==='claim'?bundle.topology.claim_state[id]:undefined;
  const displayStatement=node.statement??node.question??node.procedure??node.summary;
  const direct=prov?.direct??[]; const roots=prov?.source_roots??[]; const desc=(blast.downstream_claims as string[]|undefined)??[];
  const inEdges=incoming.get(id)??[],outEdges=outgoing.get(id)??[];
  const guided=node.type==='claim'?ratchetsForClaim(bundle,id):[];
  return <main className="page">
    <header className="detail-hero"><div className="eyebrow"><TypeBadge type={node.type}/><StateBadge>{node.status}</StateBadge>{node.review_state&&<StateBadge tone={node.review_state==='reviewed'?'good':'warn'}>{node.review_state}</StateBadge>}</div><h1>{node.title??node.id}</h1>{displayStatement&&<p className="lede">{displayStatement}</p>}<div className="button-row"><CopyLinkButton/><a className="button button-ghost" href={href('/graph',{focus:id})}>Open in graph</a></div><p className="mono idline">{node.id}</p></header>
    <KeyFacts node={node}/>
    {node.type==='receipt'&&<ReceiptView node={node} bundle={bundle}/>} {node.type==='source'&&<SourceView node={node}/>} {node.type==='derivation'&&<DerivationView node={node} bundle={bundle}/>} 
    {node.type==='claim'&&topo&&<Section title="Structural state" aside={<StateBadge tone={topo.structural_state==='burdened'?'warn':'good'}>{topo.structural_state}</StateBadge>}><p className="muted">Structural state only; not a truth judgment.</p><div className="two-col"><div><h3>Direct burdens</h3><RefList ids={topo.direct_burdens} bundle={bundle}/></div><div><h3>Inherited burdens</h3><RefList ids={topo.inherited_burdens} bundle={bundle}/></div></div></Section>}
    {node.type==='claim'&&guided.length>0&&<Section title="Examine this claim" aside={<span className="count">{guided.length}</span>}><p className="muted">Walk the authored argument branches yourself. Your choices stay local to your browser and never alter the canonical case graph.</p><div className="guided-claim-actions">{guided.map(r=><a className="guided-claim-action" href={href(`/guided/${r.id}`)} key={r.id}><span><strong>{r.title}</strong><small>{r.summary}</small></span><b>Start →</b></a>)}</div></Section>}
    <div className="two-col panels">
      <Section title="WHY?" aside={<span className="count">{direct.length}</span>}><p className="muted">Direct provenance dependencies for this node.</p><RefList ids={direct} bundle={bundle}/>{roots.length>0&&<><h3>Source roots</h3><RefList ids={roots} bundle={bundle}/></>}</Section>
      <Section title="WHAT DEPENDS ON THIS?" aside={<span className="count">{desc.length}</span>}><p className="muted">Downstream claims in the dependency blast radius.</p><RefList ids={desc} bundle={bundle}/>{Array.isArray(blast.downstream_ratchets)&&blast.downstream_ratchets.length>0&&<><h3>Downstream ratchets</h3><RefList ids={blast.downstream_ratchets} bundle={bundle}/></>}</Section>
    </div>
    <Section title="Semantic relationships"><div className="edge-grid"><div><h3>Outgoing</h3>{outEdges.length?outEdges.map(e=><div className="edge-row" key={e.id}><span className="relation">{e.relation.replaceAll('_',' ')}</span>{nodes.get(e.to)?<NodeLink node={nodes.get(e.to)!}/>:e.to}<p>{e.rationale}</p></div>):<Empty/>}</div><div><h3>Incoming</h3>{inEdges.length?inEdges.map(e=><div className="edge-row" key={e.id}>{nodes.get(e.from)?<NodeLink node={nodes.get(e.from)!}/>:e.from}<span className="relation">{e.relation.replaceAll('_',' ')}</span><p>{e.rationale}</p></div>):<Empty/>}</div></div></Section>
    {node.body&&node.body.trim()&&<Section title="Authored note"><div className="body-copy">{node.body}</div></Section>}
  </main>
}
