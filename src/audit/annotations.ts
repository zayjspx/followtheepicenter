import { z } from 'zod';
import { reviewState, type Authored } from '../schemas/nodes';
const id=z.string().regex(/^[a-z]+-[a-z0-9][a-z0-9-]*$/);
const text=z.string().min(1), number=z.number().finite();
const base={id:z.string().regex(/^aud-[a-z0-9-]+$/),review_state:reviewState};
export const annotationSchema=z.discriminatedUnion('kind',[
  z.object({...base,kind:z.literal('comparison'),claim:id,left:id,right:id,operator:z.enum(['gt','gte','lt','lte','eq','ne']),unit:text,tolerance:number.nonnegative()}).strict(),
  z.object({...base,kind:z.literal('independence'),claim:id,edges:z.array(id).min(2).refine(a=>new Set(a).size===a.length,'Duplicate support edge')}).strict(),
  z.object({...base,kind:z.literal('independent_support'),edge:id}).strict(),
  z.object({...base,kind:z.literal('physical_quantity'),node:id,entity:text,quantity:text,scope:text,unit:text}).strict(),
  z.object({...base,kind:z.literal('calibration'),method:id,input:id,output:id,entity:text,scope:text,input_unit:text,output_unit:text,scale:number.positive(),offset:number}).strict(),
  z.object({...base,kind:z.literal('typed_value'),claim:id,entity:text,quantity:text,scope:text,value:number,unit:text,tolerance:number.nonnegative()}).strict()
]);
export const auditMetadataSchema=z.object({schema_version:z.literal(1),records:z.array(annotationSchema)}).strict();
export type Annotation=z.infer<typeof annotationSchema>;
export type AuditMetadata=z.infer<typeof auditMetadataSchema>;
export const emptyAudit=():AuditMetadata=>({schema_version:1,records:[]});
export function supportEndpoints(edge: Extract<Authored,{type:'edge'}>) {
  if (['supports','weakly_supports','uniquely_supports','discriminates_for'].includes(edge.relation)) return {evidence:edge.from,target:edge.to};
  if(edge.relation==='predicted_by') return {evidence:edge.to,target:edge.from};
  return undefined;
}
export function validateAnnotations(metadata: AuditMetadata, records: Authored[]) {
  const index=new Map(records.map(n=>[n.id,n]));
  const seen=new Set<string>();
  const get=(id:string,types?:Authored['type'][])=>{
    const n=index.get(id);
    if(!n) throw new Error('Audit annotation dangling reference: '+id);
    if(types && !types.includes(n.type)) throw new Error('Audit annotation wrong type: '+id);
    return n;
  };
  for(const a of metadata.records) {
    if(seen.has(a.id)) throw new Error('Duplicate audit annotation ID: '+a.id);
    seen.add(a.id);
    const refs:Authored[]=[];
    const use=(id:string,types?:Authored['type'][])=>{const n=get(id,types);refs.push(n);return n;};
    switch(a.kind) {
      case 'comparison':
        use(a.claim,['claim']);
        for(const key of [a.left,a.right]) {
          const n=use(key,['measurement','assumption','derivation']);
          if(n.type==='assumption' && n.value===undefined) throw new Error('Non-numeric audit operand: '+n.id);
        } break;
      case 'independence':
        use(a.claim,['claim']);
        for(const id of a.edges) {
          const e=use(id,['edge']) as Extract<Authored,{type:'edge'}>;
          const ep=supportEndpoints(e);
          if(!ep || ep.target!==a.claim) throw new Error('Independence group must identify support edges to its claim');
          use(ep.evidence);
        } break;
      case 'independent_support': {
        const e=use(a.edge,['edge']) as Extract<Authored,{type:'edge'}>;
        const ep=supportEndpoints(e);
        if(!ep) throw new Error('Independent support annotation requires a support/prediction edge');
        use(ep.evidence);use(ep.target);break;
      }
      case 'physical_quantity': use(a.node,['inference','claim','measurement','derivation']);break;
      case 'calibration':
        use(a.method,['method']);use(a.input,['measurement']);use(a.output,['inference','claim','measurement','derivation']);break;
      case 'typed_value': use(a.claim,['claim']);break;
    }
    if(a.review_state==='reviewed' && refs.some(n=>n.review_state!=='reviewed' || n.type==='session' || (n.type==='diagnostic' && n.status!=='verified')))
      throw new Error('Reviewed annotation references excluded record: '+a.id);
  }
}
