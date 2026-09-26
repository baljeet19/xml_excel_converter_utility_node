import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { FormatName } from '../models/xml-node.js';
import { projectRoot } from './files.js';

export async function log(format: FormatName, level: 'INFO' | 'ERROR', message: string): Promise<void> {
  const folder = path.join(projectRoot, 'logs');
  await mkdir(folder, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  await appendFile(path.join(folder, `${format}-${date}.log`), `${new Date().toISOString()} [${level}] ${message}\n`);
}
