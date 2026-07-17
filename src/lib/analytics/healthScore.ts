import type { HealthMetrics, CalculatedKPIs } from './types';

export const calculateHealthScore = (kpis: CalculatedKPIs): HealthMetrics => {
  // Financial Score (40% weight)
  // Metrics: Profit Margin, Cash Flow
  let financialScore = 0;
  if (kpis.profitMargin > 20) financialScore = 100;
  else if (kpis.profitMargin > 10) financialScore = 80;
  else if (kpis.profitMargin > 0) financialScore = 60;
  else if (kpis.profitMargin > -10) financialScore = 40;
  else financialScore = 20;

  // Inventory Score (20% weight)
  // Metrics: Low Stock Count, Status
  let inventoryScore = 100;
  if (kpis.inventoryStatus === 'At Risk') inventoryScore -= 30;
  inventoryScore -= Math.min(kpis.lowStockCount * 5, 50);
  inventoryScore = Math.max(inventoryScore, 20);

  // Customer Score (20% weight)
  // Metrics: Satisfaction, Retention
  let customerScore = (kpis.averageRating / 5) * 100;
  if (kpis.customerRetention === 'Low') customerScore -= 20;
  if (kpis.customerRetention === 'High') customerScore = Math.min(customerScore + 10, 100);
  customerScore = Math.max(customerScore, 20);

  // Growth Score (20% weight)
  // Metrics: Sales Growth
  let growthScore = 50;
  if (kpis.salesGrowth > 20) growthScore = 100;
  else if (kpis.salesGrowth > 10) growthScore = 80;
  else if (kpis.salesGrowth > 0) growthScore = 60;
  else if (kpis.salesGrowth > -10) growthScore = 40;
  else growthScore = 20;

  // We leave Operations Score out of the final average or give it minimal weight if wanted
  // But requirement says: Fin 40%, Inv 20%, Cus 20%, Gro 20%.
  let operationsScore = 75; // Default

  const healthScore = Math.round(
    (financialScore * 0.4) + 
    (inventoryScore * 0.2) + 
    (customerScore * 0.2) + 
    (growthScore * 0.2)
  );

  let grade = 'Critical';
  if (healthScore >= 90) grade = 'Excellent';
  else if (healthScore >= 75) grade = 'Good';
  else if (healthScore >= 60) grade = 'Average';
  else if (healthScore >= 40) grade = 'Poor';

  // Construct recommendations and risks
  const topStrengths: string[] = [];
  const topRisks: string[] = [];
  const recommendations: string[] = [];

  if (financialScore >= 80) topStrengths.push('Strong profit margins');
  else if (financialScore < 50) {
    topRisks.push('Low profitability or operating at a loss');
    recommendations.push('Review operating expenses to improve net margin.');
  }

  if (inventoryScore >= 80) topStrengths.push('Healthy inventory levels');
  else if (inventoryScore < 50) {
    topRisks.push(`High number of low stock products (${kpis.lowStockCount})`);
    recommendations.push('Reorder low stock items to prevent stockouts.');
  }

  if (customerScore >= 80) topStrengths.push('Excellent customer satisfaction');
  else if (customerScore < 50) {
    topRisks.push('Customer satisfaction is declining');
    recommendations.push('Implement a customer feedback loop immediately.');
  }

  if (growthScore >= 80) topStrengths.push('Strong sales growth');
  else if (growthScore < 50) {
    topRisks.push('Sales growth is stagnating or negative');
    recommendations.push('Launch targeted marketing campaigns to acquire new customers.');
  }

  return {
    financialScore,
    inventoryScore,
    customerScore,
    growthScore,
    operationsScore,
    healthScore,
    grade,
    explanations: {
      financial: `Financial health is ${financialScore}/100. Profit margin is ${kpis.profitMargin}%.`,
      inventory: `Inventory health is ${inventoryScore}/100. ${kpis.lowStockCount} items low on stock.`,
      customer: `Customer health is ${customerScore}/100. Average rating is ${kpis.averageRating}/5.`,
      growth: `Growth health is ${growthScore}/100. Sales growth is ${kpis.salesGrowth}%.`,
      operations: `Operations are running at ${operationsScore}/100 efficiency.`
    },
    recommendations,
    topStrengths,
    topRisks
  };
};
