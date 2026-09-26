import type {DataBundle, EdgeRecord, NodeRecord} from '../app/types';
import {indexBundle} from '../app/data';

export const RESPONSE_KINDS=['yes','no','qualify','unknown','withdraw','non_answer','tangent'] as const;
export type ResponseKind=typeof RESPONSE_KINDS[number];
export const COMMITMENT_STATES=['accepted','rejected','qualified','withdrawn','unanswered','parked'] as const;
export type CommitmentState=typeof COMMITMENT_STATES[number];
export const SESSION_EVENT_TYPES=[
  'session_started','ratchet_activated','lock_activated','response_classified','commitment_added',
  'burden_opened','burden_closed','tangent_parked','callback_available','lock_closed',
  'ratchet_closed','note_added','session_ended'
] as const;
export type SessionEventType=typeof SESSION_EVENT_TYPES[number];

export type SessionEvent={
  event_id:string;
  sequence:number;
  occurred_at:string;
  elapsed_ms:number;
  event_type:SessionEventType;
  payload:Record<string,any>;
};
export type SessionDocument={
  schema:'interrogation.session.v1';
  session_id:string;
  title:string;
  created_at:string;
  updated_at:string;
  graph_build_id:string;
  graph_schema_version:number;
  graph_content_fingerprint:string;
  git_commit:string|null;
  events:SessionEvent[];
};
export type CommitmentRecord={
  claim_id:string;
  status:CommitmentState;
  event_id:string;
  occurred_at:string;
  elapsed_ms:number;
  answer_text?:string;
  lock_id?:string;
  ratchet_id?:string;
};
export type TangentRecord={event_id:string;text:string;topic_id?:string;occurred_at:string;elapsed_ms:number;origin_lock_id?:string};
export type CallbackRecord={event_id:string;kind:string;message:string;source_claim?:string;target_claim?:string;edge_id?:string;ratchet_id?:string;occurred_at:string;elapsed_ms:number};
export type ReplayState={
  status:'idle'|'running'|'ended';
  active_ratchet_id?:string;
  active_lock_id?:string;
  commitments:Map<string,CommitmentRecord>;
  commitment_history:CommitmentRecord[];
  open_burdens:Set<string>;
  burden_history:Array<Record<string,any>>;
  tangents:TangentRecord[];
  callbacks:CallbackRecord[];
  closed_locks:Map<string,string>;
  closed_ratchets:Map<string,string>;
  notes:Array<Record<string,any>>;
  last_response?:Record<string,any>;
};

const STORAGE_KEY='interrogation.operator.session.v1';
const CHANNEL='interrogation-session-v1';

type SessionListener=(doc:SessionDocument|null)=>void;
const listeners=new Set<SessionListener>();
let bc:BroadcastChannel|null=null;
function channel(){
  if(typeof BroadcastChannel==='undefined') return null;
  if(!bc){
    bc=new BroadcastChannel(CHANNEL);
    bc.onmessage=()=>{const doc=loadLocalSession();for(const fn of listeners)fn(doc)};
  }
  return bc;
}
export const LocalSessionAdapter={
  read():SessionDocument|null{return loadLocalSession()},
  replace(doc:SessionDocument|null){
    if(doc)localStorage.setItem(STORAGE_KEY,JSON.stringify(doc)); else localStorage.removeItem(STORAGE_KEY);
    channel()?.postMessage({kind:'session_changed'});
    for(const fn of listeners)fn(doc);
  },
  subscribe(fn:SessionListener){listeners.add(fn);channel();return()=>{listeners.delete(fn)}}
};

function pad(n:number,w=2){return String(n).padStart(w,'0')}
function localSessionId(d=new Date()){
  return `ses-local-${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}
function gitCommit(){return ((import.meta as any).env?.VITE_GIT_COMMIT as string|undefined)??null}
function nextEvent(doc:SessionDocument,event_type:SessionEventType,payload:Record<string,any>):SessionEvent{
  const now=new Date();const seq=doc.events.length+1;
  return {event_id:`${doc.session_id}-evt-${String(seq).padStart(5,'0')}`,sequence:seq,occurred_at:now.toISOString(),elapsed_ms:Math.max(0,now.getTime()-new Date(doc.created_at).getTime()),event_type,payload};
}
function append(doc:SessionDocument,...events:SessionEvent[]):SessionDocument{
  return {...doc,updated_at:events.at(-1)?.occurred_at??new Date().toISOString(),events:[...doc.events,...events]};
}
function emit(doc:SessionDocument,event_type:SessionEventType,payload:Record<string,any>){const e=nextEvent(doc,event_type,payload);return append(doc,e)}

export function createSession(bundle:DataBundle,title='Live interrogation'):SessionDocument{
  const now=new Date().toISOString();
  let doc:SessionDocument={schema:'interrogation.session.v1',session_id:localSessionId(),title,created_at:now,updated_at:now,graph_build_id:bundle.graph.build_id,graph_schema_version:bundle.graph.schema_version,graph_content_fingerprint:bundle.graph.content_fingerprint,git_commit:gitCommit(),events:[]};
  doc=emit(doc,'session_started',{title,graph_build_id:doc.graph_build_id,graph_schema_version:doc.graph_schema_version,graph_content_fingerprint:doc.graph_content_fingerprint,git_commit:doc.git_commit});
  return doc;
}
export function renameSession(doc:SessionDocument,title:string):SessionDocument{return {...doc,title:title.trim()||doc.title,updated_at:new Date().toISOString()}}
export function loadLocalSession():SessionDocument|null{
  try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;return parseSession(raw)}catch{return null}
}
export function saveLocalSession(doc:SessionDocument|null){LocalSessionAdapter.replace(doc)}
export function parseSession(raw:string):SessionDocument{
  const v=JSON.parse(raw);
  if(v?.schema!=='interrogation.session.v1'||typeof v.session_id!=='string'||!Array.isArray(v.events))throw new Error('Not an Interrogation System session v1 export.');
  for(let i=0;i<v.events.length;i++){
    const e=v.events[i];if(e.sequence!==i+1||typeof e.event_id!=='string'||!SESSION_EVENT_TYPES.includes(e.event_type))throw new Error(`Invalid event stream at sequence ${i+1}.`);
  }
  return v as SessionDocument;
}
export function sessionBuildWarning(doc:SessionDocument,bundle:DataBundle){
  if(doc.graph_build_id!==bundle.graph.build_id)return `Session was recorded against graph build ${doc.graph_build_id.slice(0,12)}, while this site is ${bundle.graph.build_id.slice(0,12)}.`;
  if(doc.graph_schema_version!==bundle.graph.schema_version)return `Session graph schema ${doc.graph_schema_version} differs from this site (${bundle.graph.schema_version}).`;
  return '';
}

function openLockBurdens(doc:SessionDocument,bundle:DataBundle,lockId:string){
  const {nodes}=indexBundle(bundle);const lock=nodes.get(lockId);if(!lock||lock.type!=='lock')return doc;
  const state=replaySession(doc);let out=doc;
  for(const burden of lock.burdens??[]){if(!state.open_burdens.has(burden))out=emit(out,'burden_opened',{burden_id:burden,lock_id:lockId,ratchet_id:state.active_ratchet_id});}
  return out;
}
function assertRunning(doc:SessionDocument){if(replaySession(doc).status==='ended')throw new Error('Session has ended. Start a new session to record additional events.')}
export function activateRatchet(doc:SessionDocument,bundle:DataBundle,ratchetId:string):SessionDocument{
  assertRunning(doc);const {nodes}=indexBundle(bundle);const ratchet=nodes.get(ratchetId);if(!ratchet||ratchet.type!=='ratchet')throw new Error(`Unknown ratchet ${ratchetId}`);
  let out=emit(doc,'ratchet_activated',{ratchet_id:ratchetId,title:ratchet.title});
  out=emit(out,'lock_activated',{ratchet_id:ratchetId,lock_id:ratchet.entry_lock,reason:'ratchet_entry'});
  return openLockBurdens(out,bundle,ratchet.entry_lock);
}
export function activateLock(doc:SessionDocument,bundle:DataBundle,lockId:string,reason='operator_selected'):SessionDocument{
  assertRunning(doc);const {nodes}=indexBundle(bundle);const lock=nodes.get(lockId);if(!lock||lock.type!=='lock')throw new Error(`Unknown lock ${lockId}`);
  const ratchetId=findRatchetForLock(bundle,lockId)??replaySession(doc).active_ratchet_id;
  let out=emit(doc,'lock_activated',{ratchet_id:ratchetId,lock_id:lockId,reason});
  return openLockBurdens(out,bundle,lockId);
}
export function findRatchetForLock(bundle:DataBundle,lockId:string){
  return bundle.graph.nodes.find(n=>n.type==='ratchet'&&Array.isArray(n.locks)&&n.locks.includes(lockId))?.id;
}
function responseCommitment(response:ResponseKind):CommitmentState|undefined{
  switch(response){case 'yes':return 'accepted';case 'no':return 'rejected';case 'qualify':return 'qualified';case 'withdraw':return 'withdrawn';case 'unknown':case 'non_answer':return 'unanswered';default:return undefined;}
}
function conflictEdges(bundle:DataBundle,a:string,b:string):EdgeRecord[]{
  const bad=new Set(['contradicts','inconsistent_with','tension_with']);
  return bundle.graph.edges.filter(e=>bad.has(e.relation)&&((e.from===a&&e.to===b)||(e.from===b&&e.to===a)));
}
function appendDynamicCallbacks(doc:SessionDocument,bundle:DataBundle,newClaim:string,newStatus:CommitmentState,prior:ReplayState){
  if(!['accepted','qualified'].includes(newStatus))return doc;
  let out=doc;
  for(const [other,c] of prior.commitments){
    if(other===newClaim||!['accepted','qualified'].includes(c.status))continue;
    for(const edge of conflictEdges(bundle,newClaim,other)){
      const fingerprint=`${edge.id}:${[newClaim,other].sort().join(':')}`;
      if(prior.callbacks.some(x=>(x as any).fingerprint===fingerprint))continue;
      out=emit(out,'callback_available',{kind:'commitment_conflict',fingerprint,edge_id:edge.id,relation:edge.relation,source_claim:other,target_claim:newClaim,message:`Current commitment may require reconciliation with earlier ${c.status} commitment via ${edge.relation.replaceAll('_',' ')}.`});
    }
  }
  return out;
}
export function classifyResponse(doc:SessionDocument,bundle:DataBundle,response:ResponseKind,answerText=''):SessionDocument{
  assertRunning(doc);const before=replaySession(doc);const active=before.active_lock_id;if(!active)throw new Error('No active Lock.');
  const {nodes}=indexBundle(bundle);const lock=nodes.get(active);if(!lock||lock.type!=='lock')throw new Error(`Active lock ${active} is unavailable.`);
  const ratchetId=before.active_ratchet_id??findRatchetForLock(bundle,active);
  const branch=lock.branches?.[response];
  let out=emit(doc,'response_classified',{ratchet_id:ratchetId,lock_id:active,response,answer_text:answerText.trim(),branch_lock_id:branch});
  const commitment=responseCommitment(response);
  if(commitment){
    for(const target of lock.targets??[]){
      const targetNode=nodes.get(target);if(targetNode?.type!=='claim')continue;
      const prior=replaySession(out);
      out=emit(out,'commitment_added',{claim_id:target,status:commitment,lock_id:active,ratchet_id:ratchetId,answer_text:answerText.trim()});
      out=appendDynamicCallbacks(out,bundle,target,commitment,prior);
    }
  }
  // A tangent never advances the active proof obligation. It can be parked separately.
  if(response==='tangent')return out;
  if(branch&&nodes.get(branch)?.type==='lock'){
    out=emit(out,'lock_activated',{ratchet_id:findRatchetForLock(bundle,branch)??ratchetId,lock_id:branch,reason:`response:${response}`,from_lock_id:active});
    out=openLockBurdens(out,bundle,branch);
  }
  return out;
}
export function closeActiveLock(doc:SessionDocument,closure:string,note=''):SessionDocument{
  assertRunning(doc);const state=replaySession(doc);if(!state.active_lock_id)throw new Error('No active Lock.');
  return emit(doc,'lock_closed',{lock_id:state.active_lock_id,ratchet_id:state.active_ratchet_id,closure,note:note.trim()});
}
export function closeBurden(doc:SessionDocument,burdenId:string,resolution:string,note=''):SessionDocument{
  assertRunning(doc);return emit(doc,'burden_closed',{burden_id:burdenId,resolution,note:note.trim(),lock_id:replaySession(doc).active_lock_id,ratchet_id:replaySession(doc).active_ratchet_id});
}
export function closeActiveRatchet(doc:SessionDocument,closure:string,note=''):SessionDocument{
  assertRunning(doc);const state=replaySession(doc);if(!state.active_ratchet_id)throw new Error('No active ratchet.');
  return emit(doc,'ratchet_closed',{ratchet_id:state.active_ratchet_id,closure,note:note.trim()});
}
export function parkTangent(doc:SessionDocument,text:string,topicId?:string):SessionDocument{
  assertRunning(doc);if(!text.trim())throw new Error('Tangent text is required.');const state=replaySession(doc);
  return emit(doc,'tangent_parked',{text:text.trim(),topic_id:topicId||undefined,origin_lock_id:state.active_lock_id,origin_ratchet_id:state.active_ratchet_id});
}
export function addSessionNote(doc:SessionDocument,text:string):SessionDocument{
  assertRunning(doc);if(!text.trim())return doc;const state=replaySession(doc);return emit(doc,'note_added',{text:text.trim(),lock_id:state.active_lock_id,ratchet_id:state.active_ratchet_id});
}
export function endSession(doc:SessionDocument,note=''):SessionDocument{assertRunning(doc);return emit(doc,'session_ended',{note:note.trim()})}

export function replaySession(doc:SessionDocument,throughSequence=Infinity):ReplayState{
  const state:ReplayState={status:'idle',commitments:new Map(),commitment_history:[],open_burdens:new Set(),burden_history:[],tangents:[],callbacks:[],closed_locks:new Map(),closed_ratchets:new Map(),notes:[]};
  for(const e of doc.events){
    if(e.sequence>throughSequence)break;
    const p=e.payload;
    switch(e.event_type){
      case 'session_started':state.status='running';break;
      case 'ratchet_activated':state.active_ratchet_id=p.ratchet_id;break;
      case 'lock_activated':state.active_lock_id=p.lock_id;if(p.ratchet_id)state.active_ratchet_id=p.ratchet_id;break;
      case 'response_classified':state.last_response={...p,event_id:e.event_id,occurred_at:e.occurred_at,elapsed_ms:e.elapsed_ms};break;
      case 'commitment_added':{
        const c:CommitmentRecord={claim_id:p.claim_id,status:p.status,event_id:e.event_id,occurred_at:e.occurred_at,elapsed_ms:e.elapsed_ms,answer_text:p.answer_text,lock_id:p.lock_id,ratchet_id:p.ratchet_id};state.commitments.set(c.claim_id,c);state.commitment_history.push(c);break;
      }
      case 'burden_opened':state.open_burdens.add(p.burden_id);state.burden_history.push({...p,action:'opened',event_id:e.event_id,occurred_at:e.occurred_at});break;
      case 'burden_closed':state.open_burdens.delete(p.burden_id);state.burden_history.push({...p,action:'closed',event_id:e.event_id,occurred_at:e.occurred_at});break;
      case 'tangent_parked':state.tangents.push({event_id:e.event_id,text:p.text,topic_id:p.topic_id,occurred_at:e.occurred_at,elapsed_ms:e.elapsed_ms,origin_lock_id:p.origin_lock_id});break;
      case 'callback_available':state.callbacks.push({event_id:e.event_id,kind:p.kind,message:p.message,source_claim:p.source_claim,target_claim:p.target_claim,edge_id:p.edge_id,ratchet_id:p.ratchet_id,occurred_at:e.occurred_at,elapsed_ms:e.elapsed_ms,...p} as CallbackRecord);break;
      case 'lock_closed':state.closed_locks.set(p.lock_id,p.closure);break;
      case 'ratchet_closed':state.closed_ratchets.set(p.ratchet_id,p.closure);if(state.active_ratchet_id===p.ratchet_id){state.active_ratchet_id=undefined;state.active_lock_id=undefined;}break;
      case 'note_added':state.notes.push({...p,event_id:e.event_id,occurred_at:e.occurred_at,elapsed_ms:e.elapsed_ms});break;
      case 'session_ended':state.status='ended';state.active_lock_id=undefined;state.active_ratchet_id=undefined;break;
    }
  }
  return state;
}
export function staticRatchetCallbacks(bundle:DataBundle,ratchetId?:string){
  if(!ratchetId)return [] as string[];return (bundle.topology.ratchets[ratchetId]?.cross_ratchet_callbacks??[]) as string[];
}
export function staticRatchetActivations(bundle:DataBundle,ratchetId?:string){
  if(!ratchetId)return [] as string[];return (bundle.topology.ratchets[ratchetId]?.activated_by??[]) as string[];
}
export function exportSession(doc:SessionDocument){
  const blob=new Blob([JSON.stringify(doc,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${doc.session_id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function formatElapsed(ms:number){
  const s=Math.max(0,Math.floor(ms/1000));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${h}:${pad(m)}:${pad(sec)}`:`${m}:${pad(sec)}`;
}
export function describeEvent(e:SessionEvent,bundle?:DataBundle){
  const p=e.payload;const title=(id?:string)=>bundle?.graph.nodes.find(n=>n.id===id)?.title??id??'';
  switch(e.event_type){
    case 'session_started':return `Session started: ${p.title}`;
    case 'ratchet_activated':return `Ratchet activated: ${title(p.ratchet_id)}`;
    case 'lock_activated':return `Lock activated: ${title(p.lock_id)}`;
    case 'response_classified':return `${String(p.response).replaceAll('_',' ')} response at ${title(p.lock_id)}`;
    case 'commitment_added':return `${p.status} commitment: ${title(p.claim_id)}`;
    case 'burden_opened':return `Burden opened: ${title(p.burden_id)}`;
    case 'burden_closed':return `Burden closed (${p.resolution}): ${title(p.burden_id)}`;
    case 'tangent_parked':return `Tangent parked: ${p.text}`;
    case 'callback_available':return `Callback surfaced: ${p.message}`;
    case 'lock_closed':return `Lock closed: ${p.closure}`;
    case 'ratchet_closed':return `Ratchet closed: ${p.closure}`;
    case 'note_added':return `Note: ${p.text}`;
    case 'session_ended':return 'Session ended';
  }
}
