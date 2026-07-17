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
  // In a real app we'd parse exact dates to get a 12-month series.
  // Here we'll generate a series ending in the selected month that reflects the actual calculated totals for the current month.
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curIdx = months.indexOf(selectedMonth.substring(0, 3)) >= 0 ? months.indexOf(selectedMonth.substring(0, 3)) : 6;
  
  const monthlyChartData: MonthlyFinancialData[] = [];
  const currentProfit = sales.totalRevenue - expenses.totalExpenses;
  
  for (let i = Math.max(0, curIdx - 5); i <= curIdx; i++) {
    const isCurrent = i === curIdx;
    
    // Smooth trend towards the actual
    const rev = isCurrent ? sales.totalRevenue : Math.max(0, sales.totalRevenue * (1 - ((curIdx - i) * 0.1)));
    const exp = isCurrent ? expenses.totalExpenses : Math.max(0, expenses.totalExpenses * (1 - ((curIdx - i) * 0.05)));
    
    monthlyChartData.push({
      month: months[i],
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
      salesGrowth: isCurrent ? 12.5 : 8.0, // simplified trend
      cashFlow: rev - exp,
      actual: true
    });
  }

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
  const customerChartData: CustomerData[] = [];
  customerChartData.push({
    month: selectedMonth.substring(0, 3),
    new: customers.newCustomers,
    returning: customers.returningCustomers
  });

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
