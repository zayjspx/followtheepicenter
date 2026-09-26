import type {DataBundle, NodeRecord, EdgeRecord} from './types';

const files={
  graph:'graph.json', provenance:'provenance.json', diagnostics:'diagnostics.json', topology:'topology.json',
  blast:'dependency-blast-radius.json', order:'interrogation-order.json'
} as const;

async function getJson(name:string){
  const url=new URL(`data/${name}`, document.baseURI).toString();
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error(`Could not load ${name} (${r.status}). Run npm run compile before serving the site.`);
  return r.json();
}
export async function loadBundle():Promise<DataBundle>{
  const [graph,provenance,diagnostics,topology,blast,order]=await Promise.all([
    getJson(files.graph),getJson(files.provenance),getJson(files.diagnostics),getJson(files.topology),getJson(files.blast),getJson(files.order)
  ]);
  const buildIds=[graph.build_id,provenance.build_id,topology.build_id,blast.build_id,order.build_id].filter(Boolean);
  if(new Set(buildIds).size!==1) throw new Error('Generated site data comes from more than one build. Re-run npm run compile.');
  return {graph,provenance,diagnostics,topology,blast,order};
}
export function indexBundle(bundle:DataBundle){
  const nodes=new Map<string,NodeRecord>(bundle.graph.nodes.map(n=>[n.id,n]));
  const edges=bundle.graph.edges as EdgeRecord[];
  const incoming=new Map<string,EdgeRecord[]>(), outgoing=new Map<string,EdgeRecord[]>();
  for(const e of edges){
    (outgoing.get(e.from)??outgoing.set(e.from,[]).get(e.from)!).push(e);
    (incoming.get(e.to)??incoming.set(e.to,[]).get(e.to)!).push(e);
  }
  return {nodes,edges,incoming,outgoing};
}
