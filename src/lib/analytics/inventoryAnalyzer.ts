import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { InventoryMetrics } from './types';

export const analyzeInventory = (table: ParsedTable): InventoryMetrics => {
  let currentStock = 0;
  let inventoryValue = 0;
  const lowStockProducts: string[] = [];
  const outOfStockProducts: string[] = [];

  // Find column keys
  const getCol = (keywords: string[]) => table.headers.find(h => keywords.some(k => h.includes(k)));
  
  const prodCol = getCol(['product', 'item', 'name']);
  const stockCol = getCol(['stock', 'quantity', 'qty', 'count', 'on_hand', 'inventory']);
  const priceCol = getCol(['price', 'cost', 'value', 'unit']);

  table.rows.forEach(row => {
    if (!stockCol) return;

    const stock = extractNumber(row[stockCol]);
    currentStock += stock;

    if (priceCol) {
      const price = extractNumber(row[priceCol]);
      inventoryValue += (stock * price);
    }

    if (prodCol && row[prodCol]) {
      const prodName = String(row[prodCol]).trim();
      if (stock === 0) {
        outOfStockProducts.push(prodName);
      } else if (stock < 20) { // arbitrary low stock threshold for demo
        lowStockProducts.push(prodName);
      }
    }
  });

  return {
    currentStock,
    inventoryValue,
    lowStockProducts,
    outOfStockProducts
  };
};
