import { test, expect } from '@playwright/test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseXmlFile } from '../src/converters/xml-reader.js';
import { writeWorkbook } from '../src/converters/excel-writer.js';
import { readWorkbook } from '../src/converters/excel-reader.js';
import { buildXml } from '../src/converters/xml-builder.js';

for (const [format, source] of [['format1', 'format1-sample.xml'], ['format2', 'format2-sample.xml'], ['format3', 'format3-sample.txt']] as const) {
  test(`${format} round-trip preserves XML nodes`, async () => {
    const folder = await mkdtemp(path.join(os.tmpdir(), 'xml-excel-'));
    const sourcePath = path.join(process.cwd(), 'tests', 'fixtures', format, source);
    const nodes = await parseXmlFile(sourcePath);
    const book = path.join(folder, `${format}.xlsx`);
    writeWorkbook(nodes, [], format, book);
    const restoredNodes = readWorkbook(book);
    expect(restoredNodes).toEqual(nodes);
    const xmlPath = path.join(folder, 'restored.xml');
    await writeFile(xmlPath, buildXml(restoredNodes));
    const reparsed = await parseXmlFile(xmlPath);
    expect(reparsed.map(n => ({ ...n, fileName: '' }))).toEqual(restoredNodes.map(n => ({ ...n, fileName: '' })));
  });
}
