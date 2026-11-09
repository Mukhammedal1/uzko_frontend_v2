import type { ExportTable } from "@/types/common.types";
import { createZip } from "@/utils/zip";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const columnName = (index: number) => {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const cell = (value: string, row: number, column: number, style: number) =>
  `<c r="${columnName(column)}${row}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;

const buildSheet = (table: ExportTable) => {
  const widths = table.headers.map((header, column) => {
    const longest = Math.max(
      header.length,
      ...table.rows.map((row) =>
        Math.max(0, ...(row[column] ?? "").split("\n").map((l) => l.length)),
      ),
    );
    return Math.min(60, Math.max(12, longest + 2));
  });

  const cols = widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join("");

  const headerRow = `<row r="1">${table.headers
    .map((header, column) => cell(header, 1, column, 1))
    .join("")}</row>`;

  const bodyRows = table.rows
    .map(
      (row, index) =>
        `<row r="${index + 2}">${row
          .map((value, column) => cell(value, index + 2, column, 2))
          .join("")}</row>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${headerRow}${bodyRows}</sheetData></worksheet>`;
};

const buildXlsx = (table: ExportTable) =>
  createZip([
    {
      path: "[Content_Types].xml",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    },
    {
      path: "_rels/.rels",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(table.title.slice(0, 31).replace(/[\\/?*[\]:]/g, " "))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    },
    {
      path: "xl/styles.xml",
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>',
    },
    { path: "xl/worksheets/sheet1.xml", content: buildSheet(table) },
  ]);

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadXlsx = (table: ExportTable) => {
  const bytes = buildXlsx(table);
  saveBlob(
    new Blob([bytes as BlobPart], { type: XLSX_MIME }),
    `${table.fileName}.xlsx`,
  );
};

export const printPdf = (table: ExportTable) => {
  const head = table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = table.rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (value) => `<td>${escapeHtml(value).replace(/\n/g, "<br>")}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(table.fileName)}</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111}h1{font-size:16px;margin:0 0 10px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f0f0f0}tr{page-break-inside:avoid}</style></head><body><h1>${escapeHtml(table.title)}</h1><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;

  const frame = window.open("", "_blank");
  if (!frame) return false;
  frame.document.open();
  frame.document.write(html);
  frame.document.close();
  frame.focus();
  setTimeout(() => frame.print(), 300);
  return true;
};
