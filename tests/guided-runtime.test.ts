import {describe,expect,it} from 'vitest';
import type {DataBundle} from '../src/app/types';
import {guidedDomain,impactForResponse,ratchetsForClaim} from '../src/guided/runtime';

const base=(id:string,type:string,extra:Record<string,any>={})=>({id,type,title:id,summary:id,status:'active',review_state:'reviewed',...extra});
function bundle():DataBundle{
  const nodes:any[]=[
    base('clm-a','claim',{statement:'A'}),base('clm-b','claim',{statement:'B'}),base('bur-a','burden',{statement:'Burden A'}),
    base('rec-a','receipt',{quote:'source'}),base('sup-a','measurement',{}),
    base('lck-a','lock',{question:'Stand by A?',targets:['clm-a'],receipts:['rec-a'],burdens:['bur-a'],branches:{yes:'lck-b',no:'lck-b',qualify:'lck-b',unknown:'lck-a',withdraw:'lck-b',non_answer:'lck-a',tangent:'lck-a'}}),
    base('lck-b','lock',{question:'What follows?',targets:['clm-b'],receipts:['rec-a'],burdens:[],branches:{yes:'lck-b',no:'lck-b',qualify:'lck-b',unknown:'lck-b',withdraw:'lck-b',non_answer:'lck-b',tangent:'lck-b'}}),
    base('rat-a','ratchet',{tags:['audio'],entry_lock:'lck-a',locks:['lck-a','lck-b'],convergence_burdens:['bur-a']})
  ];
  return {
    graph:{schema_version:1,build_id:'b'.repeat(64),content_fingerprint:'c'.repeat(64),nodes,edges:[],derivations:[]},
    provenance:{schema_version:1,build_id:'b'.repeat(64),nodes:{},links:[]},diagnostics:{candidates:[]},
    topology:{schema_version:1,build_id:'b'.repeat(64),claim_state:{'clm-a':{all_burdens:['bur-a'],support_paths:['sup-a']},'clm-b':{all_burdens:[],support_paths:[]}},ratchets:{'rat-a':{targets:['clm-a'],cross_ratchet_callbacks:[],activated_by:[]}},response_patterns:{},fingerprint:'x'},
    blast:{schema_version:1,build_id:'b'.repeat(64),records:{'clm-a':{downstream_claims:['clm-b']}},fingerprint:'x'},
    order:{schema_version:1,build_id:'b'.repeat(64),baseline_order:[{ratchet:'rat-a'}],fingerprint:'x'}
  };
}

describe('self-guided runtime',()=>{
  it('finds ratchets that directly target a claim',()=>expect(ratchetsForClaim(bundle(),'clm-a').map(r=>r.id)).toEqual(['rat-a']));
  it('keeps canonical support and downstream impact visible when exploring a NO branch',()=>{
    const x=impactForResponse(bundle(),'lck-a','no');
    expect(x.effect_title).toBe('Claim is rejected in this path');
    expect(x.next_lock_id).toBe('lck-b');
    expect(x.downstream_claims).toEqual(['clm-b']);
    expect(x.open_burdens).toEqual(['bur-a']);
    expect(x.support_paths).toEqual(['sup-a']);
  });
  it('does not advance a tangent and explicitly preserves the active burden',()=>{
    const x=impactForResponse(bundle(),'lck-a','tangent');
    expect(x.next_lock_id).toBe('lck-a');
    expect(x.effect_title).toBe('Active burden does not move');
  });
  it('maps ratchets to a plain-language domain without changing graph semantics',()=>expect(guidedDomain(bundle().graph.nodes.find(n=>n.id==='rat-a')!)).toBe('Acoustics'));
});
