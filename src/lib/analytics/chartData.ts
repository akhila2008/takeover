import type { SalesMetrics, ExpenseMetrics, InventoryMetrics, CustomerMetrics, ProductData } from './types';
import type { 
  MonthlyFinancialData, 
  InventoryData, 
  CustomerData, 
  RevenueSourceData, 
  TopProductData 
} from '../../context/BusinessDataContext';

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

export const generateChartData = (
  sales: SalesMetrics,
  expenses: ExpenseMetrics,
  inventory: InventoryMetrics,
  customers: CustomerMetrics,
  selectedMonth: string
) => {

  // 1. Monthly Financial Data (trend)
  // Historical trend is now built dynamically in BusinessDataContext by parsing all historical files.
  // We don't hallucinate it here anymore.
  const monthlyChartData: MonthlyFinancialData[] = [];

  // 2. Inventory Data
  const inventoryChartData: InventoryData[] = [];
  if (inventory.currentStock > 0) {
    inventoryChartData.push({ name: 'Healthy Stock', value: inventory.currentStock - inventory.lowStockProducts.length, color: '#22c55e' });
    inventoryChartData.push({ name: 'Low Stock', value: inventory.lowStockProducts.length, color: '#eab308' });
    inventoryChartData.push({ name: 'Out of Stock', value: inventory.outOfStockProducts.length, color: '#ef4444' });
  } else {
    // Empty state
    inventoryChartData.push({ name: 'No Data', value: 1, color: '#333' });
  }

  // 3. Customer Data
  // Also built dynamically in BusinessDataContext across 12 months.
  const customerChartData: CustomerData[] = [];

  // 4. Revenue Sources Data
  const revenueSourcesData: RevenueSourceData[] = [];
  let idx = 0;
  sales.categoryMap.forEach((val, key) => {
    revenueSourcesData.push({
      name: key,
      value: val,
      color: COLORS[idx % COLORS.length]
    });
    idx++;
  });
  if (revenueSourcesData.length === 0) {
    revenueSourcesData.push({ name: 'No Data', value: 1, color: '#333' });
  }

  // 5. Top Products Data
  let topProductsData: TopProductData[] = Array.from(sales.productMap.values());
  topProductsData.sort((a, b) => b.revenue - a.revenue);
  topProductsData = topProductsData.slice(0, 5);

  return {
    monthlyChartData,
    inventoryChartData,
    customerChartData,
    revenueSourcesData,
    topProductsData
  };
};
