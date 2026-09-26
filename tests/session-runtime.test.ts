import {describe,expect,it} from 'vitest';
import type {DataBundle} from '../src/app/types';
import {activateRatchet,classifyResponse,createSession,parkTangent,replaySession} from '../src/session/runtime';

const base=(id:string,type:string,extra:Record<string,any>={})=>({id,type,title:id,summary:id,status:'active',review_state:'reviewed',...extra});
function bundle():DataBundle{
  const nodes:any[]=[
    base('clm-a','claim',{statement:'A'}),base('clm-b','claim',{statement:'B'}),base('bur-a','burden',{statement:'burden'}),
    base('lck-one','lock',{question:'Stand by A?',targets:['clm-a'],receipts:['rec-x'],burdens:['bur-a'],branches:{yes:'lck-two',no:'lck-two',qualify:'lck-two',unknown:'lck-two',withdraw:'lck-two',non_answer:'lck-one',tangent:'lck-one'}}),
    base('lck-two','lock',{question:'Stand by B?',targets:['clm-b'],receipts:['rec-x'],burdens:['bur-a'],branches:{yes:'lck-two',no:'lck-two',qualify:'lck-two',unknown:'lck-two',withdraw:'lck-two',non_answer:'lck-two',tangent:'lck-two'}}),
    base('rat-test','ratchet',{entry_lock:'lck-one',locks:['lck-one','lck-two'],convergence_burdens:['bur-a'],closure_states:['unresolved']}),
    base('rec-x','receipt',{})
  ];
  const edge:any=base('edg-ab','edge',{from:'clm-a',to:'clm-b',relation:'tension_with',rationale:'synthetic tension'});
  return {
    graph:{schema_version:1,build_id:'b'.repeat(64),content_fingerprint:'c'.repeat(64),nodes,edges:[edge],derivations:[]},
    provenance:{schema_version:1,build_id:'b'.repeat(64),nodes:{},links:[]},
    diagnostics:{candidates:[]},
    topology:{schema_version:1,build_id:'b'.repeat(64),claim_state:{},ratchets:{'rat-test':{cross_ratchet_callbacks:[],activated_by:[]}},response_patterns:{},fingerprint:'x'},
    blast:{schema_version:1,build_id:'b'.repeat(64),records:{},fingerprint:'x'},
    order:{schema_version:1,build_id:'b'.repeat(64),baseline_order:[{ratchet:'rat-test'}],fingerprint:'x'}
  };
}
describe('event-sourced session runtime',()=>{
  it('activates an entry Lock, opens its burden, records a commitment and advances on YES',()=>{
    const b=bundle();let d=createSession(b,'test');d=activateRatchet(d,b,'rat-test');
    expect(replaySession(d).active_lock_id).toBe('lck-one');expect(replaySession(d).open_burdens.has('bur-a')).toBe(true);
    d=classifyResponse(d,b,'yes','yes, I stand by A');const s=replaySession(d);
    expect(s.commitments.get('clm-a')?.status).toBe('accepted');expect(s.active_lock_id).toBe('lck-two');
    expect(d.events.map(e=>e.sequence)).toEqual(d.events.map((_,i)=>i+1));
  });
  it('does not advance the active Lock when a response is classified as tangent',()=>{
    const b=bundle();let d=activateRatchet(createSession(b),b,'rat-test');d=classifyResponse(d,b,'tangent','what about something else?');
    expect(replaySession(d).active_lock_id).toBe('lck-one');
    d=parkTangent(d,'Something else','rat-test');const s=replaySession(d);expect(s.active_lock_id).toBe('lck-one');expect(s.tangents).toHaveLength(1);
  });
  it('surfaces an authored tension as a callback when two accepted commitments become active',()=>{
    const b=bundle();let d=activateRatchet(createSession(b),b,'rat-test');d=classifyResponse(d,b,'yes','A');d=classifyResponse(d,b,'yes','B');
    const s=replaySession(d);expect(s.callbacks).toHaveLength(1);expect(s.callbacks[0].edge_id).toBe('edg-ab');
  });
  it('reconstructs historical state at a prior sequence without mutating the document',()=>{
    const b=bundle();let d=activateRatchet(createSession(b),b,'rat-test');const before=d.events.length;d=classifyResponse(d,b,'yes','A');
    const historical=replaySession(d,before);expect(historical.commitments.size).toBe(0);expect(historical.active_lock_id).toBe('lck-one');expect(d.events.length).toBeGreaterThan(before);
  });
});
