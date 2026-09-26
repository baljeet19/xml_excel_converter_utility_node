import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readWorkbook } from '../converters/excel-reader.js';
import { buildXml } from '../converters/xml-builder.js';
import { adapterFor } from '../formats/index.js';
import { assertFormat, formatFolder } from '../utils/files.js';
import { log } from '../utils/logger.js';

async function main(): Promise<void> {
  const format = assertFormat(arg('--format'));
  const workbook = arg('--file');
  if (!workbook) throw new Error('Provide --file <workbook.xlsx>');
  const allNodes = readWorkbook(workbook);
  const outputFolder = formatFolder('xml-output', format);
  await mkdir(outputFolder, { recursive: true });
  const groups = new Map<string, typeof allNodes>();
  for (const node of allNodes) {
    const group = groups.get(node.fileName) ?? [];
    group.push(node);
    groups.set(node.fileName, group);
  }
  for (const [fileName, nodes] of groups) {
    if (!fileName || !nodes) continue;
    const validation = adapterFor(format).validate(nodes);
    if (validation.length) throw new Error(validation.join('; '));
    const xml = buildXml(nodes);
    const outputName = `${path.parse(fileName).name}.xml`;
    const output = path.join(outputFolder, outputName);
    await writeFile(output, xml, 'utf8');
    await log(format, 'INFO', `Created ${output}`);
    console.log(`Created: ${output}`);
  }
}
function arg(name: string): string | undefined { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; }
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
