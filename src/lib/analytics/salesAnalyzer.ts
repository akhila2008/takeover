import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { SalesMetrics, ProductData, SalesTransaction } from './types';

export const analyzeSales = (table: ParsedTable): SalesMetrics => {
  let totalRevenue = 0;
  const productMap = new Map<string, ProductData>();
  const categoryMap = new Map<string, number>();
  let totalOrders = 0;

  // Find column keys strictly by priority order
  const getColByPriority = (priorities: string[]) => {
    for (const p of priorities) {
      const match = table.headers.find(h => h.includes(p));
      if (match) return match;
    }
    return undefined;
  };
  
  const prodCol = getColByPriority(['product', 'item', 'name']);
  const revCol = getColByPriority(['revenue', 'total revenue', 'sales amount', 'sales', 'amount', 'total']);
  const qtyCol = getColByPriority(['quantity', 'qty', 'count']);
  const catCol = getColByPriority(['category', 'type', 'group']);

  const invCol = getColByPriority(['invoice', 'id', 'transaction', 'order']);
  const dateCol = getColByPriority(['date', 'time', 'timestamp']);
  const custCol = getColByPriority(['customer', 'client', 'buyer']);
  const payCol = getColByPriority(['payment', 'method', 'type']);
  
  const transactions: SalesTransaction[] = [];

  table.rows.forEach(row => {
    // If no specific revenue column is found but there's a generic amount column, we could try to guess, 
    // but relying on finding the column is safer.
    if (!revCol) return;

    const rowRev = extractNumber(row[revCol]);
    if (rowRev <= 0) return; // Ignore negative or 0 sales here, or handle returns? We'll ignore 0.

    totalRevenue += rowRev;
    totalOrders += 1;
    
    const qty = qtyCol ? extractNumber(row[qtyCol]) : 1;
    const cat = catCol ? String(row[catCol]).trim() : 'Uncategorized';
    let prodName = 'Unknown';

    if (prodCol && row[prodCol]) {
      prodName = String(row[prodCol]).trim();
      if (prodName) {
        const existing = productMap.get(prodName) || { name: prodName, quantity: 0, revenue: 0, category: cat };
        existing.quantity += qty;
        existing.revenue += rowRev;
        productMap.set(prodName, existing);
      }
    }

    const existingCat = categoryMap.get(cat) || 0;
    categoryMap.set(cat, existingCat + rowRev);
    
    transactions.push({
      invoiceId: invCol && row[invCol] ? String(row[invCol]).trim() : `INV-${totalOrders}`,
      date: dateCol && row[dateCol] ? String(row[dateCol]).trim() : 'Unknown Date',
      customer: custCol && row[custCol] ? String(row[custCol]).trim() : 'Unknown Customer',
      product: prodName,
      category: cat,
      quantity: qty,
      unitPrice: qty > 0 ? Number((rowRev / qty).toFixed(2)) : rowRev,
      revenue: rowRev,
      paymentMethod: payCol && row[payCol] ? String(row[payCol]).trim() : 'Unknown'
    });
  });

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    productMap,
    categoryMap,
    totalOrders,
    averageOrderValue,
    transactions
  };
};
