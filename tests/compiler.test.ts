import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compileDocuments, compileVault } from '../src/compiler/compiler';
import { readVault, parseMarkdown, hash, type Document } from '../src/compiler/parser';
import { authoredSchema, type Authored } from '../src/schemas/nodes';
import { quantity, convert, evaluate } from '../src/compiler/arithmetic';

const root = process.cwd();
const fixture = () => readVault(path.join(root, 'fixtures/itd/vault'));
const modify = async (id: string, change: (node: any) => void) => {
  const docs = await fixture();
  const doc = docs.find(d => d.node.id === id)!;
  change(doc.node);
  doc.sha256 = hash(JSON.stringify(doc.node));
  return docs;
};
describe('ITD end-to-end acceptance', () => {
  it('compiles Markdown/YAML into graph JSON with independent arithmetic and ancestry', async () => {
    const result = await compileVault('fixtures/itd/vault', root);
    expect(result.graph.nodes).toHaveLength(8);
    expect(result.graph.edges).toHaveLength(1);
    expect(result.graph.derivations[0].value).toBeCloseTo(113.70262390670554, 10);
    expect(result.graph.derivations[0].value).not.toBe(113.70);
    expect(result.provenance.nodes['der-itd-max'].ancestors).toEqual(expect.arrayContaining(['asm-phone-baseline-39mm', 'inv-plane-wave-itd', 'rec-itd-inputs', 'src-itd-synthetic']));
    expect(result.provenance.nodes['src-itd-synthetic'].descendants).toContain('der-itd-max');
    expect(result.manifest.integrity.sources[0].verification).toBe('local_bytes_verified');
    expect(result.manifest.integrity.receipts[0].verification).toBe('quote_verified_at_lines');
    expect(JSON.parse(JSON.stringify(result.graph))).toEqual(result.graph);
  });
  it('produces identical output regardless of document enumeration order', async () => {
    const docs = await fixture();
    expect(await compileDocuments(docs, root)).toEqual(await compileDocuments(docs.reverse(), root));
  });
  it('recalculates when an input changes and changes the dependency fingerprint', async () => {
    const before = await compileDocuments(await fixture(), root);
    const docs = await modify('asm-phone-baseline-39mm', n => { n.value = 0.04; });
    const der = docs.find(d => d.node.id === 'der-itd-max')!.node;
    if (der.type === 'derivation') der.expected = { value: 116.62, tolerance: 0.05 };
    const after = await compileDocuments(docs, root);
    expect(after.graph.derivations[0].value).toBeCloseTo(116.61807580174928, 10);
    expect(after.provenance.nodes['der-itd-max'].fingerprint).not.toBe(before.provenance.nodes['der-itd-max'].fingerprint);
  });
});
describe('validation boundaries', () => {
  it('rejects missing frontmatter', () => expect(() => parseMarkdown('plain text', 'bad.md')).toThrow('frontmatter'));
  it('rejects duplicate YAML keys', () => expect(() => parseMarkdown('---\nid: a\nid: b\n---\n', 'bad.md')).toThrow());
  it('rejects unrecognized ontology types', () => expect(authoredSchema.safeParse({ type: 'truth_score' }).success).toBe(false));
  it('requires the canonical envelope', async () => {
    const n: any = (await fixture())[0].node; delete n.review_state;
    expect(authoredSchema.safeParse(n).success).toBe(false);
  });
  it('rejects unknown authored fields rather than silently dropping them', async () => {
    expect(authoredSchema.safeParse({ ...(await fixture())[0].node, truth_score: 1 }).success).toBe(false);
  });
  it('requires invariant applicability and non-applicability', async () => {
    const n: any = (await fixture()).find(d => d.node.type === 'invariant')!.node;
    delete n.does_not_apply_when; expect(authoredSchema.safeParse(n).success).toBe(false);
  });
  it('rejects invalid receipt ranges', async () => {
    const n: any = (await fixture()).find(d => d.node.type === 'receipt')!.node;
    n.locator = { kind: 'lines', start: 9, end: 1 }; expect(authoredSchema.safeParse(n).success).toBe(false);
  });
  it('rejects incorrect ID prefixes', async () => {
    expect(authoredSchema.safeParse({ ...(await fixture())[0].node, id: 'clm-wrong-prefix' }).success).toBe(false);
  });
  it('rejects duplicate IDs', async () => {
    const docs = await fixture(); await expect(compileDocuments([...docs, docs[0]], root)).rejects.toThrow('Duplicate ID');
  });
  it('rejects dangling references', async () => {
    await expect(compileDocuments(await modify('der-itd-max', n => { n.inputs.baseline.node = 'asm-missing'; }), root)).rejects.toThrow('dangling');
  });
  it('rejects references to wrong epistemic types', async () => {
    await expect(compileDocuments(await modify('mea-itd-reported', n => { n.observed_from = ['asm-phone-baseline-39mm']; }), root)).rejects.toThrow('wrong reference type');
  });
  it('rejects dangling edge endpoints', async () => {
    await expect(compileDocuments(await modify('edg-itd-baseline', n => { n.to = 'asm-missing'; }), root)).rejects.toThrow('dangling');
  });
  it('rejects numerical derivation cycles', async () => {
    await expect(compileDocuments(await modify('der-itd-max', n => { n.inputs.baseline.node = n.id; }), root)).rejects.toThrow('input cycle');
  });
  it('rejects oracle disagreement', async () => {
    await expect(compileDocuments(await modify('der-itd-max', n => { n.expected.value = 200; }), root)).rejects.toThrow('oracle mismatch');
  });
  it('rejects unsupported units', async () => {
    await expect(compileDocuments(await modify('der-itd-max', n => { n.output.unit = 'bananas'; }), root)).rejects.toThrow('Unsupported unit');
  });
  it('rejects dimensionally incorrect output', async () => {
    await expect(compileDocuments(await modify('der-itd-max', n => { n.output.unit = 'm'; }), root)).rejects.toThrow('dimension mismatch');
  });
  it('rejects a changed source hash', async () => {
    await expect(compileDocuments(await modify('src-itd-synthetic', n => { n.sha256 = '0'.repeat(64); }), root)).rejects.toThrow('hash mismatch');
  });
  it('rejects a misquoted receipt', async () => {
    await expect(compileDocuments(await modify('rec-itd-inputs', n => { n.quote = 'Not present'; }), root)).rejects.toThrow('quote absent');
  });
  it('rejects evidence path traversal', async () => {
    await expect(compileDocuments(await modify('src-itd-synthetic', n => { n.artifact = 'public/evidence/../../package.json'; }), root)).rejects.toThrow('escapes');
  });
  it('does not promote an unreviewed dependency into the public graph', async () => {
    await expect(compileDocuments(await modify('asm-phone-baseline-39mm', n => { n.review_state = 'machine_proposed'; }), root)).rejects.toThrow('excluded record');
  });
  it('excludes standalone review-queue material', async () => {
    const docs = await fixture();
    const extra = structuredClone(docs.find(d => d.node.type === 'assumption')!);
    extra.node.id = 'asm-unreviewed'; extra.node.review_state = 'machine_proposed';
    docs.push(extra);
    const result = await compileDocuments(docs, root);
    expect(result.graph.nodes.some(n => n.id === 'asm-unreviewed')).toBe(false);
    expect(result.manifest.excluded_ids).toContain('asm-unreviewed');
  });
  it('preserves first-class edge rationale and the distinction between measurement and assumption', async () => {
    const { graph } = await compileDocuments(await fixture(), root);
    expect(graph.edges[0].rationale).toContain('assumed input');
    expect(graph.nodes.find(n => n.id === 'mea-itd-reported')?.type).toBe('measurement');
    expect(graph.nodes.find(n => n.id === 'asm-phone-baseline-39mm')?.type).toBe('assumption');
  });
});
describe('safe dimensional arithmetic', () => {
  it('honors precedence and parentheses', () => {
    expect(evaluate('2 + 3 * (4 - 1)', {}).value).toBe(11);
    expect(evaluate('-2 * -3', {}).value).toBe(6);
  });
  it('converts compatible units', () => expect(convert(evaluate('a + b', { a: quantity(1, 'm'), b: quantity(2, 'cm') }), 'mm')).toBe(1020));
  it.each(['a.constructor', 'process.exit()', 'a=3', '2 ** 3', '1;2'])('rejects executable or unsupported syntax: %s', expression =>
    expect(() => evaluate(expression, { a: quantity(1, 'm') })).toThrow());
  it('rejects division by zero', () => expect(() => evaluate('1 / 0', {})).toThrow('Division by zero'));
  it('rejects incompatible addition', () => expect(() => evaluate('a + b', { a: quantity(1, 'm'), b: quantity(1, 's') })).toThrow('Incompatible dimensions'));
  it('rejects non-finite arithmetic', () => expect(() => evaluate('1e309', {})).toThrow('Non-finite'));
});
