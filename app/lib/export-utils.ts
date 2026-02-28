import type { ColumnProfile, FilterState, RowData } from '../types/dashboard';

function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function triggerDownload(content: BlobPart, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function normalizeCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  const text = String(value).trim();
  if (text === '') return null;
  if (/^(true|false)$/i.test(text)) return text.toLowerCase() === 'true';
  if (!Number.isNaN(Number(text))) return Number(text);
  return text;
}

export function exportDashboardAsHtml(rootId: string, fileName: string): void {
  const root = document.getElementById(rootId);
  if (!root) throw new Error(`Element not found: #${rootId}`);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard Export</title>
  <style>
    body { margin: 0; padding: 24px; font-family: Arial, sans-serif; background: #f8fafc; color: #111827; }
    .export-root { max-width: 1920px; margin: 0 auto; }
    svg { max-width: 100%; }
  </style>
</head>
<body>
  <div class="export-root">
    ${root.outerHTML}
  </div>
</body>
</html>`;

  triggerDownload(html, fileName, 'text/html;charset=utf-8');
}

export function exportRowsAsCsv(rows: RowData[], columns: ColumnProfile[], fileName: string): void {
  const header = columns.map((column) => escapeCsv(column.originalName)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCsv(row[column.key])).join(',')).join('\n');
  const csv = `${header}\n${body}`;
  triggerDownload(csv, fileName, 'text/csv;charset=utf-8');
}

export async function parseSpreadsheetFile(file: File): Promise<RowData[]> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.csv')) {
    return parseCsvToRows(await file.text());
  }

  let xlsx: typeof import('xlsx');
  try {
    xlsx = await import('xlsx');
  } catch {
    throw new Error("XLSX parser not found. Install dependency: npm i xlsx");
  }
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  const records = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  });

  return records.map((record, idx) => {
    const row: RowData = { __rowId: `row-${idx + 1}` };
    Object.entries(record).forEach(([key, value]) => {
      row[key] = normalizeCell(value);
    });
    return row;
  });
}

export function parseCsvToRows(text: string): RowData[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]).map((header, index) => {
    const normalized = header.trim();
    return normalized === '' ? `column_${index + 1}` : normalized;
  });

  return lines.slice(1).map((line, idx) => {
    const cells = parseLine(line);
    const row: RowData = { __rowId: `row-${idx + 1}` };
    headers.forEach((header, colIdx) => {
      const raw = cells[colIdx] ?? '';
      row[header] = normalizeCell(raw);
    });
    return row;
  });
}

export async function exportRowsAsXlsx(args: {
  rows: RowData[];
  filteredRows: RowData[];
  columns: ColumnProfile[];
  filters: FilterState;
  fileName: string;
}): Promise<void> {
  const { rows, filteredRows, columns, filters, fileName } = args;
  let ExcelJS: typeof import('exceljs');
  try {
    ExcelJS = await import('exceljs');
  } catch {
    throw new Error("Excel exporter not found. Install dependency: npm i exceljs");
  }
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dashboard App';
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 28 },
    { header: 'Value', key: 'value', width: 22 },
  ];
  summarySheet.addRows([
    { metric: 'Total Rows', value: rows.length },
    { metric: 'Filtered Rows', value: filteredRows.length },
    { metric: 'Columns', value: columns.length },
    { metric: 'Filter Logic', value: filters.logic.toUpperCase() },
    { metric: 'Active Conditions', value: filters.conditions.length },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  const sheet = workbook.addWorksheet('Data');
  sheet.columns = columns.map((column) => ({
    header: column.originalName,
    key: column.key,
    width: Math.max(14, column.originalName.length + 4),
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEFF6FF' },
  };

  const filteredIds = new Set(filteredRows.map((row) => row.__rowId));
  const shouldHighlight = filters.conditions.length > 0;

  rows.forEach((row) => {
    const record = columns.reduce<Record<string, unknown>>((acc, column) => {
      acc[column.key] = row[column.key] ?? '';
      return acc;
    }, {});
    const added = sheet.addRow(record);
    if (shouldHighlight && filteredIds.has(row.__rowId)) {
      added.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF59D' },
        };
      });
    }
  });

  const content = await workbook.xlsx.writeBuffer();
  triggerDownload(
    content,
    fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}
