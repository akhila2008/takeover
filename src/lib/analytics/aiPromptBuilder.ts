import type { CalculatedKPIs, HealthMetrics, ProductData } from './types';

export const buildAIPrompt = (
  kpis: CalculatedKPIs, 
  health: HealthMetrics, 
  topProduct: ProductData | undefined,
  periodId: string
) => {
  const jsonPayload = {
    period: periodId,
    totalRevenue: kpis.revenue,
    totalExpenses: kpis.expenses,
    netProfit: kpis.profit,
    profitMargin: kpis.profitMargin,
    healthScore: health.healthScore,
    activeCustomers: kpis.activeCustomers,
    lowStockCount: kpis.lowStockCount,
    topProduct: topProduct?.name || 'None'
  };

  const systemMessage = `
You are an expert AI Business Analyst acting as the CEO's trusted advisor.
Your objective is to provide a comprehensive executive summary based EXCLUSIVELY on the provided JSON metrics.

CRITICAL RULES:
1. Use ONLY the metrics provided in the JSON payload.
2. NEVER estimate, calculate, or invent any numbers.
3. If the netProfit is negative, you MUST clearly state the business is operating at a loss.
4. Keep the summary professional, actionable, and concise.

JSON PAYLOAD:
${JSON.stringify(jsonPayload, null, 2)}
`;

  return systemMessage;
};
