import { z } from 'zod';

const text = z.string().min(1);
const id = z.string().regex(/^[a-z]+-[a-z0-9][a-z0-9-]*$/);
const refs = z.array(id);
const nonemptyRefs = refs.min(1);
const date = z.iso.date();
const finite = z.number().finite();
export const reviewState = z.enum(['machine_proposed', 'needs_review', 'reviewed', 'rejected']);
export const lifecycle = z.enum(['active', 'superseded', 'withdrawn', 'corrected', 'archived']);
export const envelope = z.object({
  id, title: text, status: lifecycle, review_state: reviewState,
  created_at: date, updated_at: date, tags: z.array(text), summary: text
});
export const diagnosticTypes = z.enum([
  'hard_contradiction', 'tension', 'dependency_gap', 'circular_support',
  'assumption_laundering', 'pseudo_independence', 'missing_calibration',
  'source_attribution_jump', 'non_discriminating_evidence', 'temporal_resolution_overreach',
  'invariant_conflict', 'arithmetic_error', 'unit_error', 'theory_drift', 'provenance_gap'
]);
const position = z.number().int().positive();
const range = { start: position, end: position };
export const locatorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('lines'), ...range }).strict(),
  z.object({ kind: z.literal('page'), page: position, paragraph: position.optional() }).strict(),
  z.object({ kind: z.literal('paragraph'), paragraph: position }).strict(),
  z.object({ kind: z.literal('frame'), frame: z.number().int().nonnegative() }).strict(),
  z.object({ kind: z.literal('tweet'), tweet_id: z.string().regex(/^\d+$/) }).strict(),
  z.object({ kind: z.literal('timestamp'), start_seconds: finite.nonnegative(), end_seconds: finite.nonnegative() }).strict(),
  z.object({ kind: z.literal('image_region'), x: finite.nonnegative(), y: finite.nonnegative(), width: finite.positive(), height: finite.positive(), unit: z.enum(['px', 'normalized']) }).strict()
]).superRefine((v, ctx) => {
  if (v.kind === 'lines' && v.end < v.start) ctx.addIssue({ code: 'custom', message: 'Reversed line range' });
  if (v.kind === 'timestamp' && v.end_seconds < v.start_seconds) ctx.addIssue({ code: 'custom', message: 'Reversed timestamp range' });
  if (v.kind === 'image_region' && v.unit === 'normalized' && (v.x + v.width > 1 || v.y + v.height > 1))
    ctx.addIssue({ code: 'custom', message: 'Normalized region exceeds image bounds' });
});
export const sourceSchema = envelope.extend({
  type: z.literal('source'), source_type: z.enum(['webpage', 'tweet', 'screenshot', 'archived_webpage', 'pdf', 'scientific_paper', 'video', 'audio', 'photograph', 'session_recording', 'text']),
  author: text.nullable(), original_url: z.url().nullable(), published_at: z.union([date, z.iso.datetime()]).nullable(),
  captured_at: z.iso.datetime(), sha256: z.string().regex(/^[a-f0-9]{64}$/), artifact: text,
  redistribution: z.enum(['full_local', 'excerpt_only', 'metadata_only', 'external_artifact']),
  version: z.object({ family: text, sequence: position, supersedes: id.optional() }).strict()
}).strict();
export const receiptSchema = envelope.extend({
  type: z.literal('receipt'), source: id, locator: locatorSchema, quote: text.optional(), context: text
}).strict().superRefine((v, ctx) => {
  if (['lines', 'page', 'paragraph', 'tweet'].includes(v.locator.kind) && !v.quote)
    ctx.addIssue({ code: 'custom', message: 'Textual receipt requires quote' });
});
export const observationSchema = envelope.extend({
  type: z.literal('observation'), statement: text, receipts: nonemptyRefs
}).strict();
export const measurementSchema = envelope.extend({
  type: z.literal('measurement'), quantity: text, value: finite, unit: text,
  method: id, observed_from: nonemptyRefs, calibration: refs.optional()
}).strict();
export const assumptionSchema = envelope.extend({
  type: z.literal('assumption'), quantity: text.optional(), value: finite.optional(), unit: text.optional(), statement: text.optional(),
  basis: z.enum(['claimant_stated', 'literature', 'estimated', 'typical_value', 'operator_supplied', 'derived_elsewhere', 'unknown']),
  receipts: refs
}).strict().superRefine((v, ctx) => {
  const numeric = v.quantity !== undefined && v.value !== undefined && v.unit !== undefined && v.statement === undefined;
  const proposition = v.statement !== undefined && v.quantity === undefined && v.value === undefined && v.unit === undefined;
  if (!numeric && !proposition) ctx.addIssue({ code: 'custom', message: 'Assumption requires exactly numeric quantity/value/unit OR statement' });
});
export const invariantSchema = envelope.extend({
  type: z.literal('invariant'), statement: text, scope: text, units: z.array(text).min(1),
  formula: text.optional(), applies_when: z.array(text).min(1),
  does_not_apply_when: z.array(text).min(1), references: nonemptyRefs
}).strict();
export const methodSchema = envelope.extend({
  type: z.literal('method'), procedure: text, references: nonemptyRefs
}).strict();
export const derivationSchema = envelope.extend({
  type: z.literal('derivation'), expression: text,
  inputs: z.record(z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), z.union([
    z.object({ node: id }).strict(),
    z.object({ value: finite, unit: text }).strict()
  ])).refine(v => Object.keys(v).length > 0, 'At least one input is required'),
  output: z.object({ quantity: text, unit: text }).strict(),
  expected: z.object({ value: finite, tolerance: finite.nonnegative() }).strict(),
  depends_on: refs.optional()
}).strict();
export const inferenceSchema = envelope.extend({
  type: z.literal('inference'), statement: text, depends_on: nonemptyRefs
}).strict();
export const epistemicState = z.enum(['documented', 'observed', 'measured', 'calculated', 'supported_inference', 'hypothesis', 'disputed', 'unresolved', 'withdrawn', 'superseded', 'corrected']);
export const claimSchema = envelope.extend({
  type: z.literal('claim'), statement: text, asserted_by: text, receipts: nonemptyRefs,
  theory_models: nonemptyRefs, epistemic_state: epistemicState
}).strict();
export const burdenSchema = envelope.extend({
  type: z.literal('burden'), statement: text, opened_by: nonemptyRefs,
  burden_owner: text.optional(), closure_requires: z.object({ all: z.array(text).min(1) }).strict()
}).strict();
// The contract explicitly gives diagnostics a type-specific status rather than a lifecycle.
export const diagnosticSchema = envelope.extend({
  type: z.literal('diagnostic'), status: z.enum(['candidate', 'verified', 'rejected', 'needs-work']),
  diagnostic_type: diagnosticTypes, targets: nonemptyRefs, depends_on: nonemptyRefs,
  statement: text, severity: z.enum(['local', 'significant', 'load_bearing'])
}).strict();
export const escapeSchema = envelope.extend({
  type: z.literal('escape'), pattern: z.enum(['all_of_the_above', 'chaotic_event', 'malfunction', 'mystery', 'false_dichotomy', 'directionality', 'new_unrelated_evidence', 'redefinition', 'unsupported_hypothetical']),
  statement: text
}).strict();
export const responses = ['yes', 'no', 'qualify', 'unknown', 'withdraw', 'non_answer', 'tangent'] as const;
export const closureStates = z.enum(['burden_satisfied', 'claim_withdrawn', 'claim_qualified', 'contradiction_acknowledged', 'unresolved']);
export const lockSchema = envelope.extend({
  type: z.literal('lock'), question: text, targets: nonemptyRefs, receipts: nonemptyRefs,
  burdens: nonemptyRefs, closure: z.array(closureStates).min(1),
  branches: z.object(Object.fromEntries(responses.map(key => [key, id])) as Record<typeof responses[number], typeof id>).strict()
}).strict();
export const ratchetSchema = envelope.extend({
  type: z.literal('ratchet'), entry_lock: id, locks: nonemptyRefs,
  convergence_burdens: nonemptyRefs, closure_states: z.array(closureStates).min(1)
}).strict();
export const theorySchema = envelope.extend({
  type: z.literal('theory'), valid_from: date, claims: nonemptyRefs, receipts: nonemptyRefs
}).strict();
export const sessionSchema = envelope.extend({
  type: z.literal('session'), git_commit: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/), graph_schema_version: z.number().int().positive(), build_id: z.string().regex(/^[a-f0-9]{64}$/), visibility: z.enum(['private', 'public']),
  events_artifact: text
}).strict();

export const relations = [
  'quotes', 'documents', 'observes', 'measures', 'computed_by', 'derived_from', 'depends_on',
  'assumes', 'uses_method', 'supports', 'weakly_supports', 'consistent_with', 'predicted_by',
  'discriminates_for', 'uniquely_supports', 'inconsistent_with', 'contradicts', 'tension_with',
  'requires', 'requires_consistency_with', 'satisfies', 'fails_to_satisfy', 'supersedes',
  'revises', 'withdraws', 'source_of', 'challenges', 'if_yes', 'if_no', 'if_qualify',
  'if_unknown', 'if_withdraw', 'if_non_answer', 'if_tangent', 'triggers', 'blocks_escape',
  'converges_on', 'opens_burden', 'closes_burden'
] as const;
export const edgeSchema = envelope.extend({
  type: z.literal('edge'), from: id, relation: z.enum(relations), to: id,
  rationale: text, receipts: refs.optional(), depends_on: refs.optional()
}).strict();
export const nodeSchema = z.discriminatedUnion('type', [
  sourceSchema, receiptSchema, observationSchema, measurementSchema, assumptionSchema,
  invariantSchema, methodSchema, derivationSchema, inferenceSchema, claimSchema,
  burdenSchema, diagnosticSchema, escapeSchema, lockSchema, ratchetSchema, theorySchema, sessionSchema
]);
const prefixes: Record<string, string> = {
  source: 'src', receipt: 'rec', observation: 'obs', measurement: 'mea', assumption: 'asm',
  invariant: 'inv', method: 'met', derivation: 'der', inference: 'inf', claim: 'clm',
  burden: 'bur', diagnostic: 'dgn', escape: 'esc', lock: 'lck', ratchet: 'rat', theory: 'thy', session: 'ses', edge: 'edg'
};
export const authoredSchema = z.union([nodeSchema, edgeSchema]).superRefine((v, ctx) => {
  if (!v.id.startsWith(prefixes[v.type] + '-')) ctx.addIssue({ code: 'custom', message: 'ID prefix does not match type' });
  if (v.updated_at < v.created_at) ctx.addIssue({ code: 'custom', message: 'updated_at precedes created_at' });
  if (v.type === 'diagnostic' && v.status === 'verified' && v.review_state !== 'reviewed')
    ctx.addIssue({ code: 'custom', message: 'Verified diagnostic must be reviewed' });
});
export type Authored = z.infer<typeof authoredSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type Derivation = z.infer<typeof derivationSchema>;
