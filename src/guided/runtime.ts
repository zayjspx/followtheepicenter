import type {DataBundle,NodeRecord} from '../app/types';
import {indexBundle} from '../app/data';

export const GUIDED_RESPONSES=['yes','no','qualify','unknown','withdraw','non_answer','tangent'] as const;
export type GuidedResponse=typeof GUIDED_RESPONSES[number];

export const guidedResponseLabels:Record<GuidedResponse,string>={
  yes:'Yes / stand by it',
  no:'No',
  qualify:'Qualify / narrow it',
  unknown:'Unknown',
  withdraw:'Withdraw it',
  non_answer:'No direct answer',
  tangent:'Raise another issue'
};

export const guidedResponseShort:Record<GuidedResponse,string>={
  yes:'Yes',no:'No',qualify:'Qualify',unknown:'Unknown',withdraw:'Withdraw',non_answer:'Non-answer',tangent:'Tangent'
};

export type GuidedImpact={
  response:GuidedResponse;
  next_lock_id?:string;
  target_claims:string[];
  downstream_claims:string[];
  open_burdens:string[];
  support_paths:string[];
  effect_title:string;
  effect_text:string;
  note:string;
};

export function ratchetsForClaim(bundle:DataBundle,claimId:string):NodeRecord[]{
  const {nodes}=indexBundle(bundle);
  const ids=Object.entries(bundle.topology.ratchets)
    .filter(([,t]:any)=>(t.targets??[]).includes(claimId))
    .map(([id])=>id);
  return ids.map(id=>nodes.get(id)).filter(Boolean) as NodeRecord[];
}

export function primaryClaimsForRatchet(bundle:DataBundle,ratchetId:string):NodeRecord[]{
  const {nodes}=indexBundle(bundle);
  const ids=(bundle.topology.ratchets[ratchetId]?.targets??[]) as string[];
  return ids.map(id=>nodes.get(id)).filter(n=>n?.type==='claim') as NodeRecord[];
}

export function guidedDomain(r:NodeRecord){
  const tags=(r.tags??[]) as string[];
  if(tags.includes('pcb')) return 'PCB identity';
  if(tags.includes('audio')||tags.includes('itd')||tags.includes('4940')) return 'Acoustics';
  if(tags.includes('optical-flow')) return 'Imaging & motion';
  if(tags.includes('blood')) return 'Blood / timing';
  if(tags.includes('device')) return 'Device physics';
  if(tags.includes('medical')) return 'Medical model';
  if(tags.includes('meta')) return 'Theory & evidence';
  return 'Other';
}

function commitmentEffect(response:GuidedResponse){
  switch(response){
    case 'yes':return ['Claim remains asserted','This hypothetical answer keeps the target claim active. The existing proof burden does not disappear merely because the claim is affirmed.'];
    case 'no':return ['Claim is rejected in this path','This hypothetical answer rejects the target claim. Downstream claims that structurally depend on it would need review, but they are not automatically false.'];
    case 'qualify':return ['Claim scope narrows','The stronger wording can no longer be used unchanged. A qualified claim or theory version is needed before downstream reasoning reuses it.'];
    case 'withdraw':return ['Claim is withdrawn in this path','The support path through this claim is removed from the hypothetical argument. Downstream dependencies should be recomputed.'];
    case 'unknown':return ['Burden remains unresolved','No affirmative support is added and the active proof obligation remains open.'];
    case 'non_answer':return ['Burden remains unresolved','The question was not answered directly, so the proof obligation does not close.'];
    case 'tangent':return ['Active burden does not move','A new issue may be worth examining, but it does not answer the current question or alter the current proof obligation.'];
  }
}

export function impactForResponse(bundle:DataBundle,lockId:string,response:GuidedResponse):GuidedImpact{
  const {nodes}=indexBundle(bundle); const lock=nodes.get(lockId);
  if(!lock||lock.type!=='lock') throw new Error(`Unknown lock ${lockId}`);
  const targets=((lock.targets??[]) as string[]).filter(id=>nodes.get(id)?.type==='claim');
  const downstream=new Set<string>(); const burdens=new Set<string>((lock.burdens??[]) as string[]); const supports=new Set<string>();
  for(const id of targets){
    const blast=bundle.blast.records[id]??{}; for(const x of (blast.downstream_claims??[]) as string[]) downstream.add(x);
    const state=bundle.topology.claim_state[id]??{}; for(const x of (state.all_burdens??[]) as string[]) burdens.add(x); for(const x of (state.support_paths??[]) as string[]) supports.add(x);
  }
  const [effect_title,effect_text]=commitmentEffect(response);
  return {
    response,
    next_lock_id:lock.branches?.[response],
    target_claims:targets,
    downstream_claims:[...downstream].sort(),
    open_burdens:[...burdens].sort(),
    support_paths:[...supports].sort(),
    effect_title,effect_text,
    note:'This is a structural what-if, not a truth verdict and not a mutation of the canonical case graph.'
  };
}

export function reviewedDiagnosticsForTargets(bundle:DataBundle,targetIds:string[]){
  return bundle.graph.nodes.filter(n=>n.type==='diagnostic'&&n.status==='verified'&&(
    (n.targets??[]).some((x:string)=>targetIds.includes(x)) || (n.depends_on??[]).some((x:string)=>targetIds.includes(x))
  ));
}
