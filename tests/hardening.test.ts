import { describe, expect, it } from 'vitest';
import { authoredSchema, epistemicState } from '../src/schemas/nodes';
import { readVault, hash } from '../src/compiler/parser';
import { compileDocuments } from '../src/compiler/compiler';
const base = { title: 'Synthetic record', status: 'active', review_state: 'reviewed', created_at: '2026-09-26', updated_at: '2026-09-26', tags: [], summary: 'Schema test' };
const receipt = { ...base, id: 'rec-test', type: 'receipt', source: 'src-test', context: 'Synthetic context' };
describe('approved hardening gate', () => {
  it.each([{kind:'frame',frame:1},{kind:'timestamp',start_seconds:0,end_seconds:1},{kind:'image_region',x:0,y:0,width:1,height:1,unit:'px'}])('allows non-text receipt without quote: %o', locator => {
    expect(authoredSchema.safeParse({...receipt,locator}).success).toBe(true);
    expect(authoredSchema.safeParse({...receipt,locator,context:undefined}).success).toBe(false);
  });
  it.each([{kind:'lines',start:1,end:1},{kind:'page',page:1},{kind:'paragraph',paragraph:1},{kind:'tweet',tweet_id:'123'}])('requires textual quote: %o', locator => {
    expect(authoredSchema.safeParse({...receipt,locator}).success).toBe(false);
    expect(authoredSchema.safeParse({...receipt,locator,quote:'text'}).success).toBe(true);
  });
  const assumption = {...base,id:'asm-test',type:'assumption',basis:'operator_supplied',receipts:[]};
  it('accepts numeric and propositional assumptions without mixing them', () => {
    expect(authoredSchema.safeParse({...assumption,quantity:'length',value:0,unit:'m'}).success).toBe(true);
    expect(authoredSchema.safeParse({...assumption,statement:'Object and reference are coplanar.'}).success).toBe(true);
    for (const fields of [{},{value:1},{statement:'p',value:1},{quantity:'x',value:1},{quantity:'x',value:1,unit:'m',statement:'p'}])
      expect(authoredSchema.safeParse({...assumption,...fields}).success).toBe(false);
  });
  it('rejects propositional assumptions as numeric derivation inputs', async () => {
    const docs = await readVault('fixtures/itd/vault');
    const a = docs.find(d=>d.node.type==='assumption')!;
    a.node = authoredSchema.parse({...assumption,id:a.node.id,statement:'Coplanar'});
    a.sha256=hash(JSON.stringify(a.node));
    await expect(compileDocuments(docs,process.cwd())).rejects.toThrow('Propositional assumption');
  });
  it.each(epistemicState.options)('accepts frozen epistemic state %s', state => {
    expect(authoredSchema.safeParse({...base,id:'clm-test',type:'claim',statement:'p',asserted_by:'synthetic',receipts:['rec-test'],theory_models:['thy-test'],epistemic_state:state}).success).toBe(true);
  });
  it('rejects invented epistemic states', () => expect(epistemicState.safeParse('proven_true').success).toBe(false));
  it('accepts null source metadata but still requires the fields', async () => {
    const source:any=(await readVault('fixtures/itd/vault')).find(d=>d.node.type==='source')!.node;
    expect(authoredSchema.safeParse({...source,author:null,original_url:null}).success).toBe(true);
    expect(authoredSchema.safeParse({...source,author:undefined}).success).toBe(false);
    expect(authoredSchema.safeParse({...source,original_url:'not a URL'}).success).toBe(false);
  });
  it('requires all three explicit session pins and rejects the old generic pin', () => {
    const session={...base,id:'ses-test',type:'session',git_commit:'a'.repeat(40),graph_schema_version:2,build_id:'b'.repeat(64),visibility:'private',events_artifact:'sessions/test.json'};
    expect(authoredSchema.safeParse(session).success).toBe(true);
    for(const key of ['git_commit','graph_schema_version','build_id'])
      expect(authoredSchema.safeParse({...session,[key]:undefined}).success).toBe(false);
    expect(authoredSchema.safeParse({...session,graph_build:'old'}).success).toBe(false);
    expect(authoredSchema.safeParse({...session,git_commit:'main'}).success).toBe(false);
  });
});
