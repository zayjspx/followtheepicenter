import {describe,it,expect} from 'vitest';
import {projectWalk,validWalk,networkLinks,networkLayout,type WalkEvent} from '../src/guided/network';
import type {DataBundle} from '../src/app/types';
const bundle={graph:{build_id:'test',nodes:[{id:'a',type:'assumption'},{id:'b',type:'claim'},{id:'c',type:'claim'},{id:'other',type:'measurement'},{id:'lock',type:'lock',burdens:['burden'],branches:{yes:'lock',tangent:'lock'}},{id:'rat',type:'ratchet',locks:['lock']},{id:'burden',type:'burden'}],edges:[{id:'support',from:'b',to:'c',relation:'supports'}]},provenance:{nodes:{b:{direct:['a']},c:{direct:['b','other']},a:{direct:['b']},other:{direct:[]}},links:[]},topology:{claim_state:{c:{support_paths:['b','other']}}}} as unknown as DataBundle;
describe('local graph walk',()=>{
 it('traces cumulative affected dependencies through cycles without inventing a truth verdict',()=>{
  const before=JSON.stringify(bundle);const p=projectWalk(bundle,[{kind:'withhold',node:'a'}]);
  expect(p.paths.get('c')).toEqual(['a','b','c']);expect(p.support.get('c')).toEqual({intact:['other'],affected:['b']});expect(JSON.stringify(bundle)).toBe(before);
 });
 it('restores one premise while retaining other withheld premises',()=>{
  const events:WalkEvent[]=[{kind:'withhold',node:'a'},{kind:'withhold',node:'other'},{kind:'restore',node:'a'}];
  const p=projectWalk(bundle,events);expect(p.withheld).toEqual(new Set(['other']));expect(p.support.get('c')).toEqual({intact:['b'],affected:['other']});expect(projectWalk(bundle,events.slice(0,-1)).support.get('c')?.intact).toEqual([]);
 });
 it('keeps obligations open on yes, no, and tangent, and requires an explicit local resolution',()=>{
  const events:WalkEvent[]=[{kind:'answer',lock:'lock',ratchet:'rat',response:'yes'},{kind:'answer',lock:'lock',ratchet:'rat',response:'no'},{kind:'answer',lock:'lock',ratchet:'rat',response:'tangent'}];
  const p=projectWalk(bundle,events);expect(p.burdens.has('burden')).toBe(true);expect(p.resolved.size).toBe(0);expect(p.callbacks).toHaveLength(1);expect(p.withheld.size).toBe(0);
  expect(projectWalk(bundle,[...events,{kind:'resolve',node:'burden',text:'Local review of supplied calibration'}]).resolved.get('burden')).toBeTruthy();
 });
 it('rejects foreign builds, unknown nodes, illegal answers and empty resolution receipts',()=>{
  expect(validWalk({build:'old',events:[]},bundle)).toBe(false);
  expect(validWalk({build:'test',events:[{kind:'withhold',node:'missing'}]},bundle)).toBe(false);
  expect(validWalk({build:'test',events:[{kind:'answer',lock:'lock',ratchet:'rat',response:'verified'}]},bundle)).toBe(false);
  expect(validWalk({build:'test',events:[{kind:'resolve',node:'burden',text:''}]},bundle)).toBe(false);
  expect(validWalk({build:'test',events:[{kind:'withhold',node:'a'}]},bundle)).toBe(true);
 });
 it('keeps proposed explanations as additional unverified obligations',()=>{const p=projectWalk(bundle,[{kind:'hypothesis',text:'A different coupling mechanism',lock:'lock'}]);expect(p.hypotheses).toHaveLength(1);expect(p.resolved.size).toBe(0);expect(validWalk({build:'test',events:[{kind:'hypothesis',text:'A different coupling mechanism'}]},bundle)).toBe(true)});
 it('preserves semantic direction and exposes authored self-return branches',()=>{
  const links=networkLinks(bundle);expect(links.find(x=>x.id==='support')).toMatchObject({from:'b',to:'c',label:'supports'});expect(links.find(x=>x.id==='branch-lock-tangent')).toMatchObject({from:'lock',to:'lock'});
  const positions=networkLayout(bundle,links);expect(Object.keys(positions)).toHaveLength(bundle.graph.nodes.length);expect(Object.values(positions).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true);
 });
});
