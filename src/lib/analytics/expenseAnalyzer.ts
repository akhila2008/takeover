import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { ExpenseMetrics } from './types';

export const analyzeExpenses = (table: ParsedTable): ExpenseMetrics => {
  let totalExpenses = 0;
  const categoryMap = new Map<string, number>();
  let largestExpense: { name: string, value: number } | null = null;

  // Find column keys strictly by priority order
  const getColByPriority = (priorities: string[]) => {
    for (const p of priorities) {
      const match = table.headers.find(h => h.includes(p));
      if (match) return match;
    }
    return undefined;
  };
  
  const descCol = getColByPriority(['description', 'item', 'name', 'expense']);
  const amountCol = getColByPriority(['amount', 'expense amount', 'expense', 'cost', 'debit', 'total expense']);
  const catCol = getColByPriority(['category', 'type', 'group', 'department']);

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
