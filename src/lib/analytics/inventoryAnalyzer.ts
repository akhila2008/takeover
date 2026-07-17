import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { InventoryMetrics, InventoryItem } from './types';

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
  const reorderCol = getCol(['reorder', 'minimum', 'threshold', 'min']);
  const catCol = getCol(['category', 'type', 'group', 'department']);
  const suppCol = getCol(['supplier', 'vendor', 'manufacturer', 'brand']);

  const products: InventoryItem[] = [];

  table.rows.forEach(row => {
    if (!stockCol) return;

    const stock = extractNumber(row[stockCol]);
    currentStock += stock;

    let price = 0;
    if (priceCol) {
      price = extractNumber(row[priceCol]);
      inventoryValue += (stock * price);
    }

    if (prodCol && row[prodCol]) {
      const prodName = String(row[prodCol]).trim();
      const reorderLevel = reorderCol && row[reorderCol] ? extractNumber(row[reorderCol]) : 10; // default 10 if missing
      const cat = catCol && row[catCol] ? String(row[catCol]).trim() : 'Uncategorized';
      const supp = suppCol && row[suppCol] ? String(row[suppCol]).trim() : 'Unknown Supplier';

      if (stock === 0) {
        outOfStockProducts.push(prodName);
      } else if (stock <= reorderLevel) { 
        lowStockProducts.push(prodName);
      }
      
      products.push({
        name: prodName,
        category: cat,
        stock: stock,
        reorderLevel: reorderLevel,
        unitCost: price,
        supplier: supp,
        inventoryValue: stock * price
      });
    }
  });

  return {
    currentStock,
    inventoryValue,
    lowStockProducts,
    outOfStockProducts,
    products
  };
};
