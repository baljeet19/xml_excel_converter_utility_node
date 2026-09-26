import type { FormatName } from '../models/xml-node.js';
import { format1 } from './format1.js';
import { format2 } from './format2.js';
import { format3 } from './format3.js';
export const adapters = { format1, format2, format3 };
export const adapterFor = (format: FormatName) => adapters[format];
