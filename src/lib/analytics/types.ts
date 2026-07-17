export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: 'parsing' | 'analyzed';
  dateUploaded: string;
  day: number;
  month: string;
  year: number;
  rawContent?: string;
  hash?: string;
}

export interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
  category?: string;
}

export interface InventoryItem {
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  unitCost: number;
  supplier: string;
  inventoryValue: number;
}

export interface CustomerItem {
  customerId: string;
  name: string;
  age: number;
  city: string;
  orders: number;
  totalSpent: number;
  satisfactionScore: number;
  lastPurchase: string;
}

export interface SalesTransaction {
  invoiceId: string;
  date: string;
  customer: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  revenue: number;
  paymentMethod: string;
}

export interface ExpenseItem {
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  productMap: Map<string, ProductData>;
  categoryMap: Map<string, number>;
  totalOrders: number;
  averageOrderValue: number;
  transactions: SalesTransaction[];
}

export interface ExpenseMetrics {
  totalExpenses: number;
  categoryMap: Map<string, number>;
  largestExpense: { name: string, value: number } | null;
  expenses: ExpenseItem[];
}

export interface InventoryMetrics {
  currentStock: number;
  inventoryValue: number;
  lowStockProducts: string[];
  outOfStockProducts: string[];
  products: InventoryItem[];
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  totalSpending: number;
  satisfactionResponses: number;
  totalSatisfaction: number;
  averageSpending: number;
  customerSatisfaction: number;
  customers: CustomerItem[];
}

export interface CalculatedKPIs {
  hasSales: boolean;
  hasExpenses: boolean;
  hasInventory: boolean;
  hasCustomers: boolean;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  grossMargin: number;
  cashFlow: number;
  salesGrowth: number;
  expenseGrowth: number;
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageRating: number;
  averageOrderValue: number;
  averageSpending: number;
  lowStockCount: number;
  lowStockProductNames: string[];
  inventoryStatus: 'Healthy' | 'Warning' | 'Critical';
  customerRetention: 'High' | 'Moderate' | 'Low';
}

export interface HealthMetrics {
  financialScore: number;
  inventoryScore: number;
  customerScore: number;
  growthScore: number;
  operationsScore: number;
  healthScore: number;
  grade: string;
  explanations: {
    financial: string;
    inventory: string;
    customer: string;
    growth: string;
    operations: string;
  };
  recommendations: string[];
  topStrengths: string[];
  topRisks: string[];
}
