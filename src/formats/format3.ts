import type { FormatAdapter } from './types.js';
export const format3: FormatAdapter = {
  name: 'format3', expectedRootTag: 'MortgageApplication',
  validate: nodes => nodes.filter(n => n.parentNodeId === null && n.tagName !== 'MortgageApplication')
    .map(n => `${n.fileName}: expected MortgageApplication root tag`)
};
