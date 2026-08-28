type ExcelCellValue = string | number | boolean | null | undefined;

export type ExcelColumn<T> = {
  header: string;
  value: (row: T, index: number) => ExcelCellValue;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeSheetName(name: string) {
  const cleaned = name.replace(/[\\/?*[\]:]/g, "").trim();
  return (cleaned || "Sheet1").slice(0, 31);
}

function fileTimestamp() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("") + "-" + [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join("");
}

function cellXml(value: ExcelCellValue) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  if (typeof value === "boolean") {
    return `<Cell><Data ss:Type="String">${value ? "是" : "否"}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${escapeXml(String(value ?? ""))}</Data></Cell>`;
}

export function exportRowsToExcel<T>(options: {
  filename: string;
  sheetName: string;
  columns: ExcelColumn<T>[];
  rows: T[];
}) {
  const headerRow = `<Row>${options.columns.map((column) => cellXml(column.header)).join("")}</Row>`;
  const bodyRows = options.rows
    .map((row, rowIndex) => `<Row>${options.columns.map((column) => cellXml(column.value(row, rowIndex))).join("")}</Row>`)
    .join("");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="${escapeXml(safeSheetName(options.sheetName))}">
    <Table>${headerRow}${bodyRows}</Table>
  </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${options.filename}-${fileTimestamp()}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
