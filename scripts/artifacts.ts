import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {compileVault} from '../src/compiler/compiler';
import {auditGraph} from '../src/audit/engine';
import {analyzeTopology,buildBlastRadius,compileInterrogationOrder} from '../src/topology/analysis';

export async function compileArtifacts(input:string,output:string) {
 const result=await compileVault(path.resolve(input),process.cwd());
 const diagnostics=auditGraph(result.graph,result.provenance);
 const topology=analyzeTopology(result.graph,result.provenance,diagnostics);
 const blastRadius=buildBlastRadius(result.graph,result.provenance);
 const interrogationOrder=compileInterrogationOrder(result.graph,result.provenance,diagnostics);
 const manifest={...result.manifest,
   audit:{engine_version:diagnostics.engine_version,detectors:diagnostics.detectors,candidate_count:diagnostics.candidates.length,fingerprint:diagnostics.fingerprint},
   topology:{fingerprint:topology.fingerprint,blast_radius_fingerprint:blastRadius.fingerprint,interrogation_order_fingerprint:interrogationOrder.fingerprint}
 };
 // No output is written until compilation, deterministic audits, and topology analysis all return.
 const artifacts={
   graph:result.graph,
   provenance:result.provenance,
   diagnostics,
   topology,
   'dependency-blast-radius':blastRadius,
   'interrogation-order':interrogationOrder,
   'build-manifest':manifest
 };
 await mkdir(output,{recursive:true});
 for(const [name,data] of Object.entries(artifacts)) await writeFile(path.join(output,name+'.json'),JSON.stringify(data,null,2)+'\n');
 // Production compilation also mirrors generated read-only data into public/data so
 // GitHub Pages can fetch the exact same build without a runtime backend.
 if(path.resolve(input)===path.resolve('vault') && path.resolve(output)===path.resolve('dist-data')) {
   const siteData=path.resolve('public/data');
   await mkdir(siteData,{recursive:true});
   for(const [name,data] of Object.entries(artifacts)) await writeFile(path.join(siteData,name+'.json'),JSON.stringify(data,null,2)+'\n');
 }
 return {input,output,build_id:result.graph.build_id,nodes:result.graph.nodes.length,edges:result.graph.edges.length,derivations:result.graph.derivations,candidates:diagnostics.candidates.map(c=>({id:c.id,detector:c.detector,fingerprint:c.fingerprint})),topology_fingerprint:topology.fingerprint};
}
