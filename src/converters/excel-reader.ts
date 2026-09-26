import XLSX from 'xlsx';
import { z } from 'zod';
import type { CanonicalNode } from '../models/xml-node.js';
import { ConversionError } from '../utils/errors.js';

const rowSchema = z.object({ FileName: z.string().min(1), NodeId: z.coerce.number().int().positive(), ParentNodeId: z.union([z.coerce.number().int().positive(), z.literal(''), z.null(), z.undefined()]), Position: z.coerce.number().int().nonnegative(), Path: z.string(), TagName: z.string().min(1), AttributesJson: z.string(), TextValue: z.union([z.string(), z.number(), z.null(), z.undefined()]) });

export function readWorkbook(filePath: string): CanonicalNode[] {
  const workbook = XLSX.readFile(filePath, { raw: false });
  const sheet = workbook.Sheets.Nodes;
  if (!sheet) throw new ConversionError('Workbook must contain a Nodes sheet.');
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rows.map((row, index) => {
    const parsed = rowSchema.safeParse(row);
    if (!parsed.success) throw new ConversionError(`Invalid Nodes row ${index + 2}: ${parsed.error.issues[0].message}`);
    try { JSON.parse(parsed.data.AttributesJson); } catch { throw new ConversionError(`Invalid AttributesJson at row ${index + 2}`); }
    return { fileName: parsed.data.FileName, nodeId: parsed.data.NodeId, parentNodeId: typeof parsed.data.ParentNodeId === 'number' ? parsed.data.ParentNodeId : null, position: parsed.data.Position, path: parsed.data.Path, tagName: parsed.data.TagName, attributesJson: parsed.data.AttributesJson, textValue: String(parsed.data.TextValue ?? '') };
  });
}
