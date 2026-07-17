export interface ParsedRow {
  [key: string]: string | number;
}

export interface ParsedTable {
  headers: string[];
  rows: ParsedRow[];
}

export const extractNumber = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  // Remove currencies, commas, spaces, etc.
  const clean = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseDocumentContent = (rawContent: string): ParsedTable => {
  const lines = rawContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Detect delimiter (comma or tab)
  const sampleLine = lines[Math.min(1, lines.length - 1)];
  const isTabSeparated = sampleLine.split('\t').length > sampleLine.split(',').length;
  const delimiter = isTabSeparated ? '\t' : ',';

  // Find the header row by looking for common column names in the first 20 lines
  let headerIdx = 0;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes('product') || lowerLine.includes('item') || 
        lowerLine.includes('expense') || lowerLine.includes('cost') ||
        lowerLine.includes('customer') || lowerLine.includes('client') ||
        lowerLine.includes('revenue') || lowerLine.includes('sales') ||
        lowerLine.includes('reorder') || lowerLine.includes('minimum') ||
        lowerLine.includes('spend')) {
      headerIdx = i;
      break;
    }
  }

  // Robust CSV parser
  const splitLine = (line: string, delim: string): string[] => {
    if (delim === '\t') return line.split('\t').map(c => c.trim());
    
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delim && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitLine(lines[headerIdx], delimiter).map(h => h.toLowerCase());
  const rows: ParsedRow[] = [];
  const seenRows = new Set<string>(); // for deduplication

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], delimiter);
    // Skip empty rows
    if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;
    
    const rowObj: ParsedRow = {};
    let isEmpty = true;
    
    headers.forEach((header, idx) => {
      let val = idx < cols.length ? cols[idx] : '';
      if (val !== '') isEmpty = false;
      rowObj[header] = val;
    });

    if (isEmpty) continue;

    // Deduplicate exact row matches
    const rowStr = JSON.stringify(rowObj);
    if (!seenRows.has(rowStr)) {
      seenRows.add(rowStr);
      rows.push(rowObj);
    }
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
