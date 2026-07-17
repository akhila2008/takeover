export interface ParsedRow {
  [key: string]: string | number;
}

export interface ParsedTable {
  headers: string[];
  rows: ParsedRow[];
}

export const extractNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Remove currencies, commas, spaces, etc.
  const clean = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseDocumentContent = (rawContent: string): ParsedTable => {
  const lines = rawContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Find the header row by looking for common column names in the first 20 lines
  let headerIdx = 0;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('product') || lowerLine.includes('item') || 
        lowerLine.includes('expense') || lowerLine.includes('cost') ||
        lowerLine.includes('customer') || lowerLine.includes('client') ||
        lowerLine.includes('revenue') || lowerLine.includes('sales')) {
      headerIdx = i;
      break;
    }
  }

  // Very basic CSV parse handling commas inside quotes
  const splitCsvLine = (line: string): string[] => {
    return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
  };

  const headers = splitCsvLine(lines[headerIdx]).map(h => h.toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    // Skip empty rows or mostly empty rows
    if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;
    
    const rowObj: ParsedRow = {};
    headers.forEach((header, idx) => {
      if (idx < cols.length) {
        rowObj[header] = cols[idx];
      }
    });
    rows.push(rowObj);
  }

  return { headers, rows };
};

// Heuristic to detect report type
export const identifyReportType = (docName: string, headers: string[]): 'sales' | 'expense' | 'inventory' | 'customer' | 'unknown' => {
  const lowerName = docName.toLowerCase();
  
  if (lowerName.includes('sales') || lowerName.includes('revenue') || headers.some(h => h.includes('sales') || h.includes('revenue'))) {
    return 'sales';
  }
  if (lowerName.includes('expense') || lowerName.includes('cost') || lowerName.includes('payroll') || headers.some(h => h.includes('expense') || h.includes('cost'))) {
    return 'expense';
  }
  if (lowerName.includes('inventory') || lowerName.includes('stock') || headers.some(h => h.includes('stock') || h.includes('inventory') || h.includes('qty'))) {
    return 'inventory';
  }
  if (lowerName.includes('customer') || lowerName.includes('client') || lowerName.includes('user') || headers.some(h => h.includes('customer') || h.includes('client') || h.includes('satisfaction'))) {
    return 'customer';
  }

  return 'unknown';
};
