import { AuditContext, type Compiled } from './context';
import { detectorNames } from './candidates';
import { arithmeticContradiction,circularSupport,pseudoIndependence,assumptionLaundering,missingCalibration,activeClaimConflict } from './detectors';
import { canonical } from '../compiler/provenance';
import { hash } from '../compiler/parser';
export function auditGraph(graph:Compiled['graph'],provenance:Compiled['provenance']) {
  const ctx=new AuditContext(graph,provenance);
  for(const detector of [arithmeticContradiction,circularSupport,pseudoIndependence,assumptionLaundering,missingCalibration,activeClaimConflict])detector(ctx);
  const candidates=ctx.results.sort((a,b)=>a.id<b.id?-1:1);
  if(new Set(candidates.map(c=>c.id)).size!==candidates.length)throw new Error('Duplicate candidate identity');
  const data={schema_version:1,engine_version:'slice-2-v1',build_id:graph.build_id,graph_fingerprint:graph.content_fingerprint,detectors:[...detectorNames],candidates};
  return {...data,fingerprint:hash(canonical(data))};
}
