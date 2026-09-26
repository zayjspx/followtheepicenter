import {describe,it,expect} from 'vitest';
import {quantity,evaluate,convert,isPhysical} from '../src/compiler/arithmetic';
import {compileVault} from '../src/compiler/compiler';
import {auditGraph} from '../src/audit/engine';
describe('release corpus integration',()=>{
 it('computes image ratios without equating pixels to physical length',()=>{
  expect(convert(evaluate('width / height',{width:quantity(87,'px'),height:quantity(36,'px')}),'1')).toBeCloseTo(87/36,12);
  expect(()=>convert(quantity(87,'px'),'mm')).toThrow('dimension mismatch');
  expect(()=>evaluate('a + b',{a:quantity(1,'px'),b:quantity(1,'m')})).toThrow('Incompatible dimensions');
  expect(isPhysical(quantity(1,'px'))).toBe(false);
 });
 it('compiles the actual frozen production vault and audits its pixel derivations',async()=>{
  const c=await compileVault('vault',process.cwd());
  expect(c.graph.nodes.filter(n=>n.type==='claim')).toHaveLength(41);
  expect(c.graph.nodes.filter(n=>n.type==='ratchet')).toHaveLength(19);
  expect(c.graph.nodes.filter(n=>n.type==='lock')).toHaveLength(68);
  expect(c.graph.derivations.find(n=>n.id==='der-magclip-image-aspect')?.value).toBeCloseTo(87/36,12);
  expect(c.manifest.integrity.sources.every(s=>s.verification==='local_bytes_verified')).toBe(true);
  expect(auditGraph(c.graph,c.provenance).candidates.every(d=>d.status==='candidate')).toBe(true);
 },30000);
});
