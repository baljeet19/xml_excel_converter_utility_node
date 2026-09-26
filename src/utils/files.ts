import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { FormatName } from '../models/xml-node.js';

export const projectRoot = process.cwd();
export const formatNames: FormatName[] = ['format1', 'format2', 'format3'];

export function assertFormat(value: string | undefined): FormatName {
  if (!value || !formatNames.includes(value as FormatName)) {
    throw new Error(`--format must be one of: ${formatNames.join(', ')}`);
  }
  return value as FormatName;
}

export function formatFolder(base: string, format: FormatName): string {
  return path.join(projectRoot, base, format);
}

export async function ensureDirectory(folder: string): Promise<void> {
  await mkdir(folder, { recursive: true });
}

export async function inputFiles(folder: string, format: FormatName): Promise<string[]> {
  const extensions = format === 'format3' ? new Set(['.xml', '.txt']) : new Set(['.xml']);
  const entries = await readdir(folder, { withFileTypes: true });
  return entries.filter(e => e.isFile() && extensions.has(path.extname(e.name).toLowerCase()))
    .map(e => path.join(folder, e.name));
}
