import {useMemo,useState} from 'react';
import type {DataBundle,NodeRecord} from './types';
import {indexBundle} from './data';
import {go,href} from './router';
import {NodeLink,Section,Truncate,TypeBadge} from './ui';

const palette:Record<string,string>={claim:'#60a5fa',burden:'#f59e0b',diagnostic:'#ef4444',ratchet:'#a78bfa',lock:'#c084fc',receipt:'#22c55e',source:'#14b8a6',measurement:'#38bdf8',assumption:'#fb923c',derivation:'#06b6d4',observation:'#34d399',invariant:'#facc15',theory:'#e879f9',escape:'#94a3b8',method:'#2dd4bf',inference:'#818cf8'};
function title(n:NodeRecord){return n.title??n.id}
function localNeighborhood(bundle:DataBundle,focus:string,depth:number){
  const {nodes}=indexBundle(bundle); const prov=bundle.provenance.nodes;
  const reverse=new Map<string,string[]>();
  for(const [id,p] of Object.entries(prov)) for(const d of p.direct??[]) (reverse.get(d)??reverse.set(d,[]).get(d)!).push(id);
  const seen=new Set([focus]); const layers:{up:string[][];down:string[][]}={up:[],down:[]};
  let up=[focus],down=[focus];
  for(let d=0;d<depth;d++){
    const u=[...new Set(up.flatMap(id=>prov[id]?.direct??[]).filter(x=>!seen.has(x)&&nodes.has(x)))];u.forEach(x=>seen.add(x));layers.up.push(u);up=u;
    const dn=[...new Set(down.flatMap(id=>reverse.get(id)??[]).filter(x=>!seen.has(x)&&nodes.has(x)))];dn.forEach(x=>seen.add(x));layers.down.push(dn);down=dn;
  }
  return {layers,ids:[...seen]};
}
function positions(bundle:DataBundle,focus:string,depth:number,w=1040,h=620){
  const {layers}=localNeighborhood(bundle,focus,depth); const pos=new Map<string,{x:number;y:number;side:string;level:number}>();pos.set(focus,{x:w/2,y:h/2,side:'focus',level:0});
  const place=(ids:string[],x:number,side:string,level:number)=>ids.forEach((id,i)=>pos.set(id,{x,y:(i+1)*h/(ids.length+1),side,level}));
  layers.up.forEach((ids,i)=>place(ids,depth===1?120:290-i*200,'up',i+1));
  layers.down.forEach((ids,i)=>place(ids,depth===1?w-120:w-290+i*200,'down',i+1));
  return pos;
}
export function GraphView({bundle,focusParam,depthParam}:{bundle:DataBundle;focusParam?:string;depthParam?:string}){
  const {nodes}=indexBundle(bundle); const fallback=bundle.order.baseline_order[0]?.targets?.[0]??[...nodes.keys()][0]; const focus=nodes.has(focusParam??'')?focusParam!:fallback; const [search,setSearch]=useState(''); const depth=depthParam==='2'?2:1;
  const pos=useMemo(()=>positions(bundle,focus,depth),[bundle,focus,depth]); const shown=[...pos.keys()];
  const directPairs=useMemo(()=>{const p=bundle.provenance.nodes;const rows:Array<{a:string;b:string}>=[];for(const a of shown)for(const b of p[a]?.direct??[])if(pos.has(b))rows.push({a,b});return rows},[bundle,shown.join('|')]);
  const results=search.trim()?bundle.graph.nodes.filter(n=>(`${n.id} ${n.title??''} ${n.summary??''} ${n.statement??''} ${(n.tags??[]).join(' ')}`).toLowerCase().includes(search.toLowerCase())).slice(0,16):[];
  return <main className="page graph-page"><header className="page-head"><div><p className="kicker">Semantic graph</p><h1>Inspect dependencies, not a spaghetti diagram.</h1><p className="lede">The graph opens around one selected node. Left is upstream provenance; right is downstream dependency. Expand to two hops when useful.</p></div></header>
    <div className="graph-toolbar"><div className="searchbox"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a claim, burden, measurement…" aria-label="Search graph nodes"/>{results.length>0&&<div className="search-popover">{results.map(n=><button key={n.id} onClick={()=>{setSearch('');go('/graph',{focus:n.id,depth})}}><TypeBadge type={n.type}/><span>{title(n)}</span></button>)}</div>}</div><div className="segmented"><a className={depth===1?'active':''} href={href('/graph',{focus,depth:1})}>1 hop</a><a className={depth===2?'active':''} href={href('/graph',{focus,depth:2})}>2 hops</a></div></div>
    <section className="graph-shell"><svg viewBox="0 0 1040 620" role="img" aria-label={`Dependency neighborhood around ${focus}`}>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#506075"/></marker></defs>
      {directPairs.map(({a,b},i)=>{const pa=pos.get(a)!,pb=pos.get(b)!;return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className="graph-edge" markerEnd="url(#arrow)"/>})}
      {shown.map(id=>{const n=nodes.get(id)!;const p=pos.get(id)!;const isFocus=id===focus;return <g key={id} className={`graph-node ${isFocus?'focus':''}`} onClick={()=>go('/graph',{focus:id,depth})} tabIndex={0} role="button"><rect x={p.x-(isFocus?102:82)} y={p.y-(isFocus?38:31)} rx="10" width={isFocus?204:164} height={isFocus?76:62} fill={palette[n.type]??'#64748b'} opacity={isFocus?1:.9}/><text x={p.x} y={p.y-8} textAnchor="middle" className="graph-type">{n.type.toUpperCase()}</text><text x={p.x} y={p.y+11} textAnchor="middle" className="graph-title"><Truncate max={isFocus?30:24}>{title(n)}</Truncate></text>{isFocus&&<text x={p.x} y={p.y+28} textAnchor="middle" className="graph-id"><Truncate max={36}>{n.id}</Truncate></text>}</g>})}
    </svg></section>
    <div className="three-col"><Section title="Selected"><TypeBadge type={nodes.get(focus)!.type}/><h3>{title(nodes.get(focus)!)}</h3><p>{nodes.get(focus)!.statement??nodes.get(focus)!.summary}</p><div className="button-row"><NodeLink node={nodes.get(focus)!} className="button">Open detail</NodeLink></div></Section><Section title="Upstream"><div className="ref-list">{(bundle.provenance.nodes[focus]?.direct??[]).slice(0,14).map(id=>nodes.get(id)&&<NodeLink key={id} node={nodes.get(id)!}/>)}</div></Section><Section title="Downstream"><div className="ref-list">{((bundle.blast.records[focus]?.downstream_claims??[]) as string[]).slice(0,14).map(id=>nodes.get(id)&&<NodeLink key={id} node={nodes.get(id)!}/>)}</div></Section></div>
    <p className="footnote">Arrows show compiled dependency ancestry. A downstream node does not automatically become false if an upstream node changes.</p>
  </main>
}
