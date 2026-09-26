import type { FormatAdapter } from './types.js';
export const format1: FormatAdapter = {
  name: 'format1', expectedRootTag: 'MortgageApplicationRequest',
  validate: nodes => nodes.filter(n => n.parentNodeId === null && n.tagName !== 'MortgageApplicationRequest')
    .map(n => `${n.fileName}: expected MortgageApplicationRequest root tag`)
};
