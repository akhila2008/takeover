import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { ExpenseMetrics } from './types';

export const analyzeExpenses = (table: ParsedTable): ExpenseMetrics => {
  let totalExpenses = 0;
  const categoryMap = new Map<string, number>();
  let largestExpense: { name: string, value: number } | null = null;

  // Find column keys
  const getCol = (keywords: string[]) => table.headers.find(h => keywords.some(k => h.includes(k)));
  
  const descCol = getCol(['description', 'item', 'name', 'expense']);
  const amountCol = getCol(['amount', 'cost', 'total', 'value', 'price']);
  const catCol = getCol(['category', 'type', 'group', 'department']);

  table.rows.forEach(row => {
    if (!amountCol) return;

    const rowAmount = extractNumber(row[amountCol]);
    if (rowAmount <= 0) return;

    totalExpenses += rowAmount;

    const desc = descCol ? String(row[descCol]).trim() : 'Unknown';
    if (!largestExpense || rowAmount > largestExpense.value) {
      largestExpense = { name: desc, value: rowAmount };
    }

    if (catCol && row[catCol]) {
      const catName = String(row[catCol]).trim();
      if (catName) {
        const existing = categoryMap.get(catName) || 0;
        categoryMap.set(catName, existing + rowAmount);
      }
    } else {
       const existing = categoryMap.get('Uncategorized') || 0; 
       categoryMap.set('Uncategorized', existing + rowAmount);
    }
  });

  return {
    totalExpenses,
    categoryMap,
    largestExpense
  };
};
