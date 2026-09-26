import path from 'node:path';
import { parseXmlFile } from '../converters/xml-reader.js';
import { writeWorkbook } from '../converters/excel-writer.js';
import { adapterFor } from '../formats/index.js';
import type { CanonicalNode, ConversionIssue } from '../models/xml-node.js';
import { assertFormat, ensureDirectory, formatFolder, inputFiles } from '../utils/files.js';
import { log } from '../utils/logger.js';

async function main(): Promise<void> {
  const format = assertFormat(arg('--format'));
  const sourceFolder = formatFolder('input', format);
  const outputFolder = formatFolder('excel-output', format);
  await ensureDirectory(outputFolder);
  const nodes: CanonicalNode[] = [], issues: ConversionIssue[] = [];
  for (const file of await inputFiles(sourceFolder, format)) {
    try { nodes.push(...await parseXmlFile(file)); }
    catch (error) { const message = error instanceof Error ? error.message : String(error); issues.push({ fileName: path.basename(file), message }); await log(format, 'ERROR', message); }
  }
  issues.push(...adapterFor(format).validate(nodes).map(message => ({ fileName: '', message })));
  if (nodes.length === 0) throw new Error(`No valid ${format} source files found in ${sourceFolder}`);
  const output = path.join(outputFolder, `${format}-consolidated.xlsx`);
  writeWorkbook(nodes, issues, format, output);
  await log(format, 'INFO', `Created ${output}; ${nodes.length} nodes from ${new Set(nodes.map(n => n.fileName)).size} files.`);
  console.log(`Created: ${output}`);
}
function arg(name: string): string | undefined { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; }
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
