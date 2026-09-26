export type FormatName = 'format1' | 'format2' | 'format3';

export interface CanonicalNode {
  fileName: string;
  nodeId: number;
  parentNodeId: number | null;
  position: number;
  path: string;
  tagName: string;
  attributesJson: string;
  textValue: string;
}

export interface ConversionIssue {
  fileName: string;
  message: string;
}
