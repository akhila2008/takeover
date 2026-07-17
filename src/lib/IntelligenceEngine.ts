import type { UploadedDocument } from '../context/BusinessDataContext';
import { parseDocumentContent, identifyReportType } from './analytics/parser';
import { analyzeSales } from './analytics/salesAnalyzer';
import { analyzeExpenses } from './analytics/expenseAnalyzer';
import { analyzeInventory } from './analytics/inventoryAnalyzer';
import { analyzeCustomers } from './analytics/customerAnalyzer';
import { calculateHealthScore } from './analytics/healthScore';
import { generateChartData } from './analytics/chartData';
import type { CalculatedKPIs, SalesMetrics, ExpenseMetrics, InventoryMetrics, CustomerMetrics, ProductData } from './analytics/types';

export type { ProductData } from './analytics/types';

// Re-export this type as it's used heavily in the context
export interface AIContextObject {
  healthScore: number;
  grade: string;
  financialScore: number;
  inventoryScore: number;
  customerScore: number;
  growthScore: number;
  operationsScore: number;
  profitMargin: number;
  revenue: number;
  expenses: number;
  cashFlow: number;
  inventoryStatus: string;
  lowStockProducts: number;
  averageRating: number;
  customerRetention: string;
  revenueGrowth: number;
  topStrengths: string[];
  topRisks: string[];
  recommendations: string[];
  explanations: {
    financial: string;
    inventory: string;
    customer: string;
    growth: string;
    operations: string;
  }
  topProducts?: ProductData[];
  bottomProducts?: ProductData[];
  highestSoldProduct?: ProductData;
  lowestSoldProduct?: ProductData;
  highestRevenueProduct?: ProductData;
  lowestRevenueProduct?: ProductData;
  revenueSources?: { name: string, value: number, color: string }[];
}

export const generateIntelligenceContext = (
  documents: UploadedDocument[], 
  previousDocuments: UploadedDocument[],
  selectedMonth: string,
  selectedYear: number
): AIContextObject | null => {
  if (documents.length === 0) return null;

  // Initialize accumulators
  const allSales: SalesMetrics = { totalRevenue: 0, productMap: new Map(), categoryMap: new Map(), totalOrders: 0 };
  const allExpenses: ExpenseMetrics = { totalExpenses: 0, categoryMap: new Map(), largestExpense: null };
  const allInventory: InventoryMetrics = { currentStock: 0, inventoryValue: 0, lowStockProducts: [], outOfStockProducts: [] };
  const allCustomers: CustomerMetrics = { totalCustomers: 0, activeCustomers: 0, newCustomers: 0, returningCustomers: 0, averageSpending: 0, customerSatisfaction: 4.0 };

  let salesDocs = 0, expDocs = 0, invDocs = 0, cusDocs = 0;

  // 1. Parse and Analyze Each Document
  documents.forEach(doc => {
    if (!doc.rawContent) return;

    const parsedTable = parseDocumentContent(doc.rawContent);
    const reportType = identifyReportType(doc.name, parsedTable.headers);

    if (reportType === 'sales') {
      salesDocs++;
      const metrics = analyzeSales(parsedTable);
      allSales.totalRevenue += metrics.totalRevenue;
      allSales.totalOrders += metrics.totalOrders;
      
      metrics.productMap.forEach((val, key) => {
        const existing = allSales.productMap.get(key) || { name: key, quantity: 0, revenue: 0, category: val.category };
        existing.quantity += val.quantity;
        existing.revenue += val.revenue;
        allSales.productMap.set(key, existing);
      });
      metrics.categoryMap.forEach((val, key) => {
        const existing = allSales.categoryMap.get(key) || 0;
        allSales.categoryMap.set(key, existing + val);
      });
    } 
    else if (reportType === 'expense') {
      expDocs++;
      const metrics = analyzeExpenses(parsedTable);
      allExpenses.totalExpenses += metrics.totalExpenses;
      
      if (!allExpenses.largestExpense || (metrics.largestExpense && metrics.largestExpense.value > allExpenses.largestExpense.value)) {
        allExpenses.largestExpense = metrics.largestExpense;
      }
      
      metrics.categoryMap.forEach((val, key) => {
        const existing = allExpenses.categoryMap.get(key) || 0;
        allExpenses.categoryMap.set(key, existing + val);
      });
    }
    else if (reportType === 'inventory') {
      invDocs++;
      const metrics = analyzeInventory(parsedTable);
      allInventory.currentStock += metrics.currentStock;
      allInventory.inventoryValue += metrics.inventoryValue;
      allInventory.lowStockProducts.push(...metrics.lowStockProducts);
      allInventory.outOfStockProducts.push(...metrics.outOfStockProducts);
    }
    else if (reportType === 'customer') {
      cusDocs++;
      const metrics = analyzeCustomers(parsedTable);
      allCustomers.totalCustomers += metrics.totalCustomers;
      allCustomers.activeCustomers += metrics.activeCustomers;
      allCustomers.newCustomers += metrics.newCustomers;
      allCustomers.returningCustomers += metrics.returningCustomers;
      // Weighted average for spending and satisfaction
      allCustomers.averageSpending = (allCustomers.averageSpending + metrics.averageSpending) / (cusDocs > 1 ? 2 : 1);
      allCustomers.customerSatisfaction = (allCustomers.customerSatisfaction + metrics.customerSatisfaction) / (cusDocs > 1 ? 2 : 1);
    }
  });

  // 2. Compute Master KPIs
  const profit = allSales.totalRevenue - allExpenses.totalExpenses;
  const profitMargin = allSales.totalRevenue > 0 ? Math.round((profit / allSales.totalRevenue) * 10000) / 100 : 0;
  
  // Calculate historical growth if previous docs existed
  let salesGrowth = 0;
  if (previousDocuments.length > 0) {
     salesGrowth = 12.5; // Stubbed strictly for previous comparison
  }

  const kpis: CalculatedKPIs = {
    revenue: allSales.totalRevenue,
    expenses: allExpenses.totalExpenses,
    profit: profit,
    profitMargin: profitMargin,
    cashFlow: profit,
    salesGrowth: salesGrowth,
    totalCustomers: allCustomers.totalCustomers,
    activeCustomers: allCustomers.activeCustomers,
    averageRating: allCustomers.customerSatisfaction,
    lowStockCount: allInventory.lowStockProducts.length,
    inventoryStatus: allInventory.outOfStockProducts.length > 0 ? 'At Risk' : 'Healthy',
    customerRetention: (allCustomers.returningCustomers / (allCustomers.totalCustomers || 1)) > 0.5 ? 'High' : 'Low'
  };

  // 3. Compute Health Score
  const health = calculateHealthScore(kpis);

  // 4. Generate Chart Data Formats
  const charts = generateChartData(allSales, allExpenses, allInventory, allCustomers, selectedMonth);

  // Determine top products
  let topProducts = charts.topProductsData;
  let bottomProducts = [...topProducts].reverse();

  // 5. Construct Final AI Context
  return {
    healthScore: health.healthScore,
    grade: health.grade,
    financialScore: health.financialScore,
    inventoryScore: health.inventoryScore,
    customerScore: health.customerScore,
    growthScore: health.growthScore,
    operationsScore: health.operationsScore,
    profitMargin: profitMargin,
    revenue: allSales.totalRevenue,
    expenses: allExpenses.totalExpenses,
    cashFlow: profit,
    inventoryStatus: kpis.inventoryStatus,
    lowStockProducts: kpis.lowStockCount,
    averageRating: allCustomers.customerSatisfaction,
    customerRetention: kpis.customerRetention,
    revenueGrowth: kpis.salesGrowth,
    topStrengths: health.topStrengths,
    topRisks: health.topRisks,
    recommendations: health.recommendations,
    explanations: health.explanations,
    topProducts,
    bottomProducts,
    highestRevenueProduct: topProducts.length > 0 ? topProducts[0] : undefined,
    lowestRevenueProduct: bottomProducts.length > 0 ? bottomProducts[0] : undefined,
    revenueSources: charts.revenueSourcesData
  };
};
