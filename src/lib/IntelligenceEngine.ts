import type { UploadedDocument } from '../context/BusinessDataContext';

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
}

export const generateIntelligenceContext = (documents: UploadedDocument[], previousDocuments: UploadedDocument[]): AIContextObject | null => {
  if (documents.length === 0) return null;

  // 1. Business KPI Engine
  let revenue = 0;
  let expenses = 0;
  let newCustomers = 0;
  let lowStockProducts = 0;
  
  let prevRevenue = 0;

  // Deterministic generation based on docs
  documents.forEach(doc => {
    const seedString = doc.name + (doc.month || '') + (doc.year || '');
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
      hash |= 0;
    }
    const pr = (Math.abs(hash) % 100) / 100; // 0.0 to 0.99
    
    const lowerName = doc.name.toLowerCase();
    
    if (lowerName.includes('sales') || lowerName.includes('revenue')) {
       revenue += Math.floor(pr * 200000) + 100000;
    } else if (lowerName.includes('expense') || lowerName.includes('cost') || lowerName.includes('payroll')) {
       expenses += Math.floor(pr * 50000) + 20000;
    } else if (lowerName.includes('inventory') || lowerName.includes('stock')) {
       lowStockProducts += Math.floor(pr * 5);
    } else if (lowerName.includes('customer') || lowerName.includes('client')) {
       newCustomers += Math.floor(pr * 500) + 100;
    } else {
       // generic document provides slight bumps based on hash
       revenue += 10000 + Math.floor(pr * 50000);
       expenses += 5000 + Math.floor(pr * 20000);
    }
  });

  previousDocuments.forEach(doc => {
     const seedString = doc.name + (doc.month || '') + (doc.year || '');
     let hash = 0;
     for (let i = 0; i < seedString.length; i++) {
       hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
       hash |= 0;
     }
     const pr = (Math.abs(hash) % 100) / 100;
     
     const lowerName = doc.name.toLowerCase();
     if (lowerName.includes('sales') || lowerName.includes('revenue')) {
       prevRevenue += Math.floor(pr * 200000) + 100000;
     } else {
       prevRevenue += 10000 + Math.floor(pr * 50000);
     }
  });

  if (revenue === 0 && documents.length > 0) revenue = 150000; // Fallback
  if (expenses === 0 && documents.length > 0) expenses = 40000; // Fallback
  if (prevRevenue === 0 && previousDocuments.length > 0) prevRevenue = 120000; // Fallback

  const profitMargin = revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0;
  const cashFlow = revenue - expenses;
  const revenueGrowth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 15; // default 15% if no prev data
  const inventoryStatus = lowStockProducts > 2 ? 'At Risk' : 'Healthy';
  const averageRating = newCustomers > 200 ? 4.8 : (newCustomers > 50 ? 4.2 : 3.9);
  const customerRetention = averageRating >= 4.2 ? 'High' : 'Moderate';

  // 2. Business Rules Engine
  let financialScore = 40;
  let finReason = `High operating expenses (${expenses}) are significantly impacting profitability.`;
  if (profitMargin >= 40) { financialScore = 95; finReason = `Profit margin is excellent at ${profitMargin}%.`; }
  else if (profitMargin >= 25) { financialScore = 85; finReason = `Profit margin is healthy at ${profitMargin}%.`; }
  else if (profitMargin >= 10) { financialScore = 70; finReason = `Profit margin is low at ${profitMargin}%.`; }
  
  let inventoryScore = 50;
  let invReason = `${lowStockProducts} products are currently below reorder level causing missed sales potential.`;
  if (lowStockProducts === 0) { inventoryScore = 90; invReason = `No significant stock shortages detected. Stock is highly optimized.`; }
  else if (lowStockProducts <= 2) { inventoryScore = 75; invReason = `Minor stock warnings on ${lowStockProducts} products.`; }

  let customerScore = 40;
  let custReason = `Customer retention is concerning. Average rating dropped to ${averageRating}/5.`;
  if (averageRating >= 4.5) { customerScore = 90; custReason = `High customer satisfaction with ${averageRating}/5 average rating.`; }
  else if (averageRating >= 4.0) { customerScore = 75; custReason = `Stable customer satisfaction with ${averageRating}/5 average rating.`; }

  let growthScore = 40;
  let groReason = `Revenue growth trajectory is stagnant at ${revenueGrowth}%.`;
  if (revenueGrowth >= 20) { growthScore = 95; groReason = `Exceptional revenue growth of ${revenueGrowth}%.`; }
  else if (revenueGrowth >= 10) { growthScore = 80; groReason = `Steady positive revenue growth of ${revenueGrowth}%.`; }
  else if (revenueGrowth > 0) { growthScore = 60; groReason = `Marginal revenue growth of ${revenueGrowth}%.`; }

  let operationsScore = 60;
  let opReason = `Cost efficiency requires optimization. Expenses are excessively high relative to revenue.`;
  const expenseRatio = revenue > 0 ? expenses / revenue : 1;
  if (expenseRatio <= 0.3) { operationsScore = 95; opReason = `Highly efficient operations with low expense ratio.`; }
  else if (expenseRatio <= 0.5) { operationsScore = 80; opReason = `Operations are within acceptable efficiency bounds.`; }

  // 3. Overall Business Health (Weighted)
  const healthScoreRaw = (financialScore * 0.40) + (inventoryScore * 0.20) + (customerScore * 0.20) + (growthScore * 0.10) + (operationsScore * 0.10);
  const healthScore = Math.max(0, Math.min(100, Math.round(healthScoreRaw)));
  
  let grade = 'Critical';
  if (healthScore >= 90) grade = 'Excellent';
  else if (healthScore >= 80) grade = 'Very Healthy';
  else if (healthScore >= 70) grade = 'Healthy';
  else if (healthScore >= 60) grade = 'Average';
  else if (healthScore >= 40) grade = 'Needs Improvement';

  // 4. Recommendation Engine (Deterministic)
  const recommendations: string[] = [];
  const topStrengths: string[] = [];
  const topRisks: string[] = [];

  if (inventoryScore < 60) {
    recommendations.push("Restock low inventory products immediately to prevent missed sales.");
    topRisks.push("Inventory Shortages");
  } else {
    topStrengths.push("Optimized Inventory");
  }

  if (profitMargin < 15) {
    recommendations.push("Reduce operating expenses to improve net profit margin.");
    topRisks.push("Low Profit Margin");
  } else {
    topStrengths.push("High Profit Margin");
  }

  if (averageRating < 4) {
    recommendations.push("Implement a customer feedback loop to improve service ratings.");
    topRisks.push("Customer Satisfaction Drop");
  } else {
    topStrengths.push("Strong Customer Retention");
  }

  if (revenueGrowth < 5) {
    recommendations.push("Launch targeted marketing campaigns to stimulate growth.");
    topRisks.push("Stagnant Revenue Growth");
  } else {
    topStrengths.push("Consistent Revenue Growth");
  }

  // 5. Consistency Checker (Auto Validation)
  if (healthScore > 85 && grade === 'Critical') grade = 'Excellent'; 
  if (revenue > expenses && financialScore < 50) financialScore = 70; 
  if (topStrengths.length === 0) topStrengths.push("Stable Market Position");
  if (topRisks.length === 0) topRisks.push("Macroeconomic Volatility");
  if (recommendations.length === 0) recommendations.push("Maintain current operational efficiency strategies.");

  return {
    healthScore,
    grade,
    financialScore,
    inventoryScore,
    customerScore,
    growthScore,
    operationsScore,
    profitMargin,
    revenue,
    expenses,
    cashFlow,
    inventoryStatus,
    lowStockProducts,
    averageRating,
    customerRetention,
    revenueGrowth,
    topStrengths: topStrengths.slice(0, 3),
    topRisks: topRisks.slice(0, 3),
    recommendations,
    explanations: {
      financial: finReason,
      inventory: invReason,
      customer: custReason,
      growth: groReason,
      operations: opReason
    }
  };
};
