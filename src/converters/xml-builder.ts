import { XMLBuilder } from 'fast-xml-parser';
import type { CanonicalNode } from '../models/xml-node.js';
import { ConversionError } from '../utils/errors.js';

type Ordered = Record<string, unknown>;
const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', preserveOrder: true, format: true, suppressEmptyNode: false });

export function buildXml(nodes: CanonicalNode[]): string {
  const byParent = new Map<number | null, CanonicalNode[]>();
  const ids = new Set(nodes.map(n => n.nodeId));
  for (const node of nodes) {
    if (node.parentNodeId !== null && !ids.has(node.parentNodeId)) throw new ConversionError(`${node.fileName}: parent node ${node.parentNodeId} does not exist`);
    const list = byParent.get(node.parentNodeId) ?? []; list.push(node); byParent.set(node.parentNodeId, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.position - b.position || a.nodeId - b.nodeId);
  const make = (node: CanonicalNode): Ordered => {
    let attrs: Record<string, string>;
    try { attrs = JSON.parse(node.attributesJson) as Record<string, string>; } catch { throw new ConversionError(`Invalid attributes for node ${node.nodeId}`); }
    const content: Ordered[] = [];
    // In preserveOrder mode, attributes are siblings of the element's child array.
    if (node.textValue !== '') content.push({ '#text': node.textValue });
    for (const child of byParent.get(node.nodeId) ?? []) content.push(make(child));
    return Object.keys(attrs).length ? { [node.tagName]: content, ':@': attrs } : { [node.tagName]: content };
  };
  const roots = byParent.get(null) ?? [];
  if (roots.length !== 1) throw new ConversionError(`Expected exactly one XML root, found ${roots.length}`);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build([make(roots[0])]);
}
