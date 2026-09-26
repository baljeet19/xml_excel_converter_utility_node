import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import type { CanonicalNode } from '../models/xml-node.js';
import { ConversionError } from '../utils/errors.js';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', preserveOrder: true, trimValues: true, parseTagValue: false, parseAttributeValue: false });
type OrderedItem = Record<string, unknown>;

export async function parseXmlFile(filePath: string): Promise<CanonicalNode[]> {
  const xml = await readFile(filePath, 'utf8');
  try { return flattenParsed(parser.parse(xml) as OrderedItem[], path.basename(filePath)); }
  catch (error) { throw new ConversionError(`Invalid XML in ${path.basename(filePath)}`, error); }
}

export function flattenParsed(root: OrderedItem[], fileName: string): CanonicalNode[] {
  const nodes: CanonicalNode[] = [];
  let nextId = 1;
  const visit = (item: OrderedItem, parentId: number | null, position: number, parentPath: string) => {
    for (const [tagName, rawChildren] of Object.entries(item)) {
      if (tagName === ':@' || tagName === '#text' || tagName === '?xml') continue;
      const children = Array.isArray(rawChildren) ? rawChildren as OrderedItem[] : [];
      const attributes = (item[':@'] ?? {}) as Record<string, string>;
      const text = children.find(x => '#text' in x)?.['#text'] ?? '';
      const ordinal = nodes.filter(n => n.parentNodeId === parentId && n.tagName === tagName).length + 1;
      const nodeId = nextId++;
      const currentPath = `${parentPath}/${tagName}[${ordinal}]`;
      nodes.push({ fileName, nodeId, parentNodeId: parentId, position, path: currentPath, tagName, attributesJson: JSON.stringify(attributes), textValue: String(text) });
      let childPosition = 0;
      for (const child of children) {
        if (':@' in child || '#text' in child || '?xml' in child) continue;
        visit(child, nodeId, childPosition++, currentPath);
      }
    }
  };
  let rootPosition = 0;
  for (const item of root) {
    if ('?xml' in item) continue;
    visit(item, null, rootPosition++, '');
  }
  return nodes;
}
