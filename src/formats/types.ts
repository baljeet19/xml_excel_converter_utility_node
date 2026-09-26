import type { CanonicalNode, FormatName } from '../models/xml-node.js';

export interface FormatAdapter {
  name: FormatName;
  expectedRootTag: string;
  validate(nodes: CanonicalNode[]): string[];
}
