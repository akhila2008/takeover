import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { SalesMetrics, ProductData } from './types';

export const analyzeSales = (table: ParsedTable): SalesMetrics => {
  let totalRevenue = 0;
  const productMap = new Map<string, ProductData>();
  const categoryMap = new Map<string, number>();
  let totalOrders = 0;

  // Find column keys
  const getCol = (keywords: string[]) => table.headers.find(h => keywords.some(k => h.includes(k)));
  
  const prodCol = getCol(['product', 'item', 'name']);
  const revCol = getCol(['revenue', 'total', 'sales', 'amount']);
  const qtyCol = getCol(['quantity', 'qty', 'count']);
  const catCol = getCol(['category', 'type', 'group']);

  table.rows.forEach(row => {
    // If no specific revenue column is found but there's a generic amount column, we could try to guess, 
    // but relying on finding the column is safer.
    if (!revCol) return;

    const rowRev = extractNumber(row[revCol]);
    if (rowRev <= 0) return; // Ignore negative or 0 sales here, or handle returns? We'll ignore 0.

    totalRevenue += rowRev;
    totalOrders += 1;

    if (prodCol && row[prodCol]) {
      const prodName = String(row[prodCol]).trim();
      if (prodName) {
        const qty = qtyCol ? extractNumber(row[qtyCol]) : 1;
        const cat = catCol ? String(row[catCol]).trim() : 'Uncategorized';
        
        const existing = productMap.get(prodName) || { name: prodName, quantity: 0, revenue: 0, category: cat };
        existing.quantity += qty;
        existing.revenue += rowRev;
        productMap.set(prodName, existing);
      }
    }

    if (catCol && row[catCol]) {
      const catName = String(row[catCol]).trim();
      if (catName) {
        const existing = categoryMap.get(catName) || 0;
        categoryMap.set(catName, existing + rowRev);
      }
    } else {
       const existing = categoryMap.get('Uncategorized') || 0;
       categoryMap.set('Uncategorized', existing + rowRev);
    }
  });

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    productMap,
    categoryMap,
    totalOrders,
    averageOrderValue
  };
};
