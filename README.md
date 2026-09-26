# XML ↔ Excel Conversion Utility

## Setup

```bash
npm install
```

Put input documents in `input/format1`, `input/format2`, or `input/format3`.
The bundled round-trip test samples are stored permanently under `tests/fixtures`; tests do not depend on a temporary `upload` folder.

## Commands

```bash
npm run convert:to-excel -- --format format1
npm run convert:to-xml -- --format format1 --file excel-output/format1/format1-consolidated.xlsx
npm test
```

The converter creates one consolidated workbook per format. `Nodes` is the lossless source of truth: it retains the filename, element order, nesting, attributes, text, and repeating elements. Do not remove `NodeId`, `ParentNodeId`, or `Position` if the workbook must convert back to XML.

The `Values` sheet is a readable list of XML paths and values. `Metadata` records the batch information and `Errors` records files that could not be processed.

Thanks