import type { ParsedTable } from './parser';
import { extractNumber } from './parser';
import type { CustomerMetrics, CustomerItem } from './types';

export const analyzeCustomers = (table: ParsedTable): CustomerMetrics => {
  let totalCustomers = 0;
  let activeCustomers = 0;
  let newCustomers = 0;
  let returningCustomers = 0;
  let totalSpending = 0;
  let totalSatisfaction = 0;
  let satisfactionResponses = 0;

  // Find column keys
  const getCol = (keywords: string[]) => table.headers.find(h => keywords.some(k => h.includes(k)));
  
  const idCol = getCol(['customer', 'id', 'client', 'name']);
  const spendCol = getCol(['spend', 'revenue', 'ltv', 'value', 'amount']);
  const activeCol = getCol(['active', 'status', 'recent']);
  const typeCol = getCol(['type', 'new', 'returning']);
  const satCol = getCol(['satisfaction', 'nps', 'rating', 'score']);

  const ageCol = getCol(['age', 'dob', 'birth', 'years']);
  const cityCol = getCol(['city', 'location', 'region', 'area', 'address']);
  const orderCol = getCol(['order', 'purchase', 'count', 'frequency']);
  const dateCol = getCol(['date', 'last', 'recent', 'time']);

  const customers: CustomerItem[] = [];

  table.rows.forEach(row => {
    if (!idCol) return;
    const cid = String(row[idCol]).trim();
    if (!cid) return;

    totalCustomers++;

    // Guess active status
    let isActive = true;
    if (activeCol) {
      const status = String(row[activeCol]).toLowerCase();
      if (status === 'false' || status === 'no' || status === 'inactive' || status === 'churned') {
        isActive = false;
      }
    }
    if (isActive) activeCustomers++;

    // Guess type
    if (typeCol) {
      const type = String(row[typeCol]).toLowerCase();
      if (type.includes('new')) newCustomers++;
      else returningCustomers++;
    } else {
      returningCustomers++;
    }

    // Spending
    let spending = 0;
    if (spendCol) {
      spending = extractNumber(row[spendCol]);
      totalSpending += spending;
    }

    // Satisfaction
    let satisfaction = 0;
    if (satCol) {
      satisfaction = extractNumber(row[satCol]);
      if (satisfaction > 0) {
        totalSatisfaction += satisfaction;
        satisfactionResponses++;
      }
    }

    customers.push({
      customerId: cid,
      name: cid, // fallback to id as name if distinct name col is not mapped separately for now
      age: ageCol && row[ageCol] ? extractNumber(row[ageCol]) : 0,
      city: cityCol && row[cityCol] ? String(row[cityCol]).trim() : 'Unknown',
      orders: orderCol && row[orderCol] ? extractNumber(row[orderCol]) : (spending > 0 ? 1 : 0),
      totalSpent: spending,
      satisfactionScore: satisfaction,
      lastPurchase: dateCol && row[dateCol] ? String(row[dateCol]).trim() : 'Unknown'
    });
  });

  const averageSpending = totalCustomers > 0 ? (totalSpending / totalCustomers) : 0;
  
  // Normalize satisfaction to out of 5 if it's large (e.g. out of 10 or 100)
  let avgSat = satisfactionResponses > 0 ? (totalSatisfaction / satisfactionResponses) : 0;
  if (avgSat > 10) avgSat = (avgSat / 100) * 5;
  else if (avgSat > 5) avgSat = (avgSat / 10) * 5;

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    returningCustomers,
    totalSpending,
    satisfactionResponses,
    totalSatisfaction,
    averageSpending,
    customerSatisfaction: avgSat || 4.0, // fallback
    customers
  };
};
