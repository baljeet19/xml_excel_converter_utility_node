import type { FormatAdapter } from './types.js';
export const format2: FormatAdapter = {
  name: 'format2', expectedRootTag: 'shiporderrequest',
  validate: nodes => nodes.filter(n => n.parentNodeId === null && n.tagName !== 'shiporderrequest')
    .map(n => `${n.fileName}: expected shiporderrequest root tag`)
};
