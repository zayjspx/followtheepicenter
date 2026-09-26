import { readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { authoredSchema, type Authored } from '../schemas/nodes';
import { createHash } from 'node:crypto';

export const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export type Document = { node: Authored; body: string; path: string; sha256: string };
export function parseMarkdown(content: string, file: string): Document {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) throw new Error(file + ': expected YAML frontmatter');
  const yaml = parseDocument(match[1], { uniqueKeys: true });
  if (yaml.errors.length) throw new Error(file + ': ' + yaml.errors.map(e => e.message).join('; '));
  const data = yaml.toJS({ maxAliasCount: 0 });
  const parsed = authoredSchema.safeParse(data);
  if (!parsed.success) throw new Error(file + ': ' + parsed.error.message);
  return { node: parsed.data, body: match[2], path: file, sha256: hash(content) };
}
export async function readVault(root: string): Promise<Document[]> {
  const base = await realpath(root);
  async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const result: string[] = [];
    for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in vault: ' + file);
      if (entry.isDirectory()) result.push(...await walk(file));
      else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
        result.push(file);
    }
    return result;
  }
  const result: Document[] = [];
  for (const file of await walk(base)) result.push(parseMarkdown(await readFile(file, 'utf8'), path.relative(base, file).split(path.sep).join('/')));
  return result;
}

export async function readAudit(root: string) {
  const { auditMetadataSchema, emptyAudit } = await import('../audit/annotations');
  let content: string;
  try { content = await readFile(path.join(root, 'audit.yaml'), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyAudit(); throw error; }
  const yaml = parseDocument(content, { uniqueKeys: true });
  if (yaml.errors.length) throw new Error('audit.yaml: ' + yaml.errors.map(e=>e.message).join('; '));
  return auditMetadataSchema.parse(yaml.toJS({ maxAliasCount: 0 }));
}
