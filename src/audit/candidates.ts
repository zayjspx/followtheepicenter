import { z } from 'zod';
export const detectorNames=['arithmetic_contradiction','circular_support','pseudo_independence','assumption_laundering','missing_calibration','active_claim_conflict'] as const;
export const diagnosticClass={
  arithmetic_contradiction:'arithmetic_error',circular_support:'circular_support',
  pseudo_independence:'pseudo_independence',assumption_laundering:'assumption_laundering',
  missing_calibration:'missing_calibration',active_claim_conflict:'hard_contradiction'
} as const;
const text=z.string().min(1);
const step=z.object({from:text,to:text,via:z.object({kind:z.enum(['field','edge','annotation']),id:text,field:text}).strict()}).strict();
export const candidateSchema=z.object({
  id:z.string().regex(/^dgn-candidate-[a-f0-9]{24}$/),
  detector:z.enum(detectorNames),diagnostic_type:z.enum(['arithmetic_error','circular_support','pseudo_independence','assumption_laundering','missing_calibration','hard_contradiction']),
  status:z.literal('candidate'),review_state:z.literal('machine_proposed'),
  triggering_nodes:z.array(text).min(1),triggering_edges:z.array(text),triggering_annotations:z.array(text),
  dependency_paths:z.array(z.object({nodes:z.array(text).min(1),steps:z.array(step)}).strict()).min(1),
  explanation:text,evidence:z.record(z.string(),z.unknown()),fingerprint:z.string().regex(/^[a-f0-9]{64}$/)
}).strict().refine(c=>c.diagnostic_type===diagnosticClass[c.detector],'Detector/class mismatch');
export type Candidate=z.infer<typeof candidateSchema>;
