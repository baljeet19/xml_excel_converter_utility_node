import XLSX from 'xlsx';
import type { CanonicalNode, ConversionIssue, FormatName } from '../models/xml-node.js';

export function writeWorkbook(nodes: CanonicalNode[], issues: ConversionIssue[], format: FormatName, outputPath: string): void {
  const workbook = XLSX.utils.book_new();
  const nodeRows = nodes.map(n => ({ FileName: n.fileName, NodeId: n.nodeId, ParentNodeId: n.parentNodeId ?? '', Position: n.position, Path: n.path, TagName: n.tagName, AttributesJson: n.attributesJson, TextValue: n.textValue }));
  const valueRows = nodes.flatMap(n => {
    const attributes = JSON.parse(n.attributesJson) as Record<string, string>;
    return [{ FileName: n.fileName, 'XML Path': n.path, Value: n.textValue }, ...Object.entries(attributes).map(([key, value]) => ({ FileName: n.fileName, 'XML Path': `${n.path}/@${key}`, Value: value }))];
  });
  const metadata = [{ Format: format, GeneratedAt: new Date().toISOString(), SourceFileCount: new Set(nodes.map(n => n.fileName)).size, SchemaVersion: '1.0' }];
  const errorRows = issues.map(i => ({ FileName: i.fileName, Message: i.message }));
  for (const [name, rows] of [['Nodes', nodeRows], ['Values', valueRows], ['Metadata', metadata], ['Errors', errorRows]] as const) {
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  }
  XLSX.writeFile(workbook, outputPath, { compression: true });
}
