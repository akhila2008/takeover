import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateIntelligenceContext } from '../lib/IntelligenceEngine';
import type { AIContextObject } from '../lib/IntelligenceEngine';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: 'parsing' | 'analyzed';
  dateUploaded: string;
  day: number;
  month: string;
  year: number;
}

interface BusinessDataState {
  healthScore: number;
  totalRevenue: number;
  activeCustomers: number;
  monthlyExpenses: number;
  cashFlow: number;
  prevHealthScore: number;
  prevTotalRevenue: number;
  prevActiveCustomers: number;
  prevMonthlyExpenses: number;
  prevCashFlow: number;
  financialScore: number;
  inventoryScore: number;
  customerScore: number;
  growthScore: number;
  operationalScore: number;
  confidenceScore: number;
  prevFinancialScore: number;
  prevInventoryScore: number;
  prevCustomerScore: number;
  prevGrowthScore: number;
  prevOperationalScore: number;
  businessGrade: string;
  documents: UploadedDocument[];
  analysisMode: 'Monthly' | 'Annual';
  selectedMonth: string;
  selectedYear: number;
  aiContext: AIContextObject | null;
  setAnalysisMode: (mode: 'Monthly' | 'Annual') => void;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
  addDocument: (doc: UploadedDocument) => void;
  updateDocumentStatus: (id: string, status: 'parsing' | 'analyzed') => void;
  updateMetricsFromDocument: (fileName: string) => void;
  removeDocument: (id: string) => void;
  generateSnapshot: () => void;
}

const nowIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

const defaultState: BusinessDataState = {
  healthScore: 0,
  totalRevenue: 0,
  activeCustomers: 0,
  monthlyExpenses: 0,
  cashFlow: 0,
  prevHealthScore: 0,
  prevTotalRevenue: 0,
  prevActiveCustomers: 0,
  prevMonthlyExpenses: 0,
  prevCashFlow: 0,
  financialScore: 0,
  inventoryScore: 0,
  customerScore: 0,
  growthScore: 0,
  operationalScore: 0,
  confidenceScore: 0,
  prevFinancialScore: 0,
  prevInventoryScore: 0,
  prevCustomerScore: 0,
  prevGrowthScore: 0,
  prevOperationalScore: 0,
  businessGrade: 'Critical',
  documents: [],
  analysisMode: 'Monthly',
  selectedMonth: nowIST.toLocaleString('default', { month: 'long' }),
  selectedYear: nowIST.getFullYear(),
  aiContext: null,
  setAnalysisMode: () => {},
  setSelectedMonth: () => {},
  setSelectedYear: () => {},
  addDocument: () => {},
  updateDocumentStatus: () => {},
  updateMetricsFromDocument: () => {},
  removeDocument: () => {},
  generateSnapshot: () => {}
};

const BusinessDataContext = createContext<BusinessDataState>(defaultState);

export const useBusinessData = () => useContext(BusinessDataContext);

const safelyGetLocalStorage = () => {
  try {
    const saved = localStorage.getItem('takeover_business_data');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('Invalid storage type, resetting.');
      localStorage.removeItem('takeover_business_data');
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Local storage corrupted, resetting to defaults.', e);
    localStorage.removeItem('takeover_business_data');
    return null;
  }
};

export const BusinessDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const savedData = safelyGetLocalStorage();

  const [healthScore, setHealthScore] = useState<number>(() => {
    return savedData && savedData.healthScore !== undefined ? savedData.healthScore : defaultState.healthScore;
  });
  const [totalRevenue, setTotalRevenue] = useState<number>(() => {
    return savedData && savedData.totalRevenue !== undefined ? savedData.totalRevenue : defaultState.totalRevenue;
  });
  const [activeCustomers, setActiveCustomers] = useState<number>(() => {
    return savedData && savedData.activeCustomers !== undefined ? savedData.activeCustomers : defaultState.activeCustomers;
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(() => {
    return savedData && savedData.monthlyExpenses !== undefined ? savedData.monthlyExpenses : defaultState.monthlyExpenses;
  });
  const [cashFlow, setCashFlow] = useState<number>(() => {
    return savedData && savedData.cashFlow !== undefined ? savedData.cashFlow : defaultState.cashFlow;
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    return savedData && Array.isArray(savedData.documents) ? savedData.documents : defaultState.documents;
  });

  const [analysisMode, setAnalysisMode] = useState<'Monthly' | 'Annual'>(() => {
    return savedData && savedData.analysisMode ? savedData.analysisMode : defaultState.analysisMode;
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return savedData && savedData.selectedMonth ? savedData.selectedMonth : defaultState.selectedMonth;
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return savedData && savedData.selectedYear ? savedData.selectedYear : defaultState.selectedYear;
  });

  const [prevHealthScore, setPrevHealthScore] = useState(defaultState.prevHealthScore);
  const [prevTotalRevenue, setPrevTotalRevenue] = useState(defaultState.prevTotalRevenue);
  const [prevActiveCustomers, setPrevActiveCustomers] = useState(defaultState.prevActiveCustomers);
  const [prevMonthlyExpenses, setPrevMonthlyExpenses] = useState(defaultState.prevMonthlyExpenses);
  const [prevCashFlow, setPrevCashFlow] = useState(defaultState.prevCashFlow);
  const [financialScore, setFinancialScore] = useState(defaultState.financialScore);
  const [inventoryScore, setInventoryScore] = useState(defaultState.inventoryScore);
  const [customerScore, setCustomerScore] = useState(defaultState.customerScore);
  const [growthScore, setGrowthScore] = useState(defaultState.growthScore);
  const [operationalScore, setOperationalScore] = useState(defaultState.operationalScore);
  const [confidenceScore, setConfidenceScore] = useState(defaultState.confidenceScore);
  
  const [prevFinancialScore, setPrevFinancialScore] = useState(defaultState.prevFinancialScore);
  const [prevInventoryScore, setPrevInventoryScore] = useState(defaultState.prevInventoryScore);
  const [prevCustomerScore, setPrevCustomerScore] = useState(defaultState.prevCustomerScore);
  const [prevGrowthScore, setPrevGrowthScore] = useState(defaultState.prevGrowthScore);
  const [prevOperationalScore, setPrevOperationalScore] = useState(defaultState.prevOperationalScore);
  
  const [businessGrade, setBusinessGrade] = useState(defaultState.businessGrade);


  const [aiContext, setAiContext] = useState<AIContextObject | null>(defaultState.aiContext);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const { data: metrics, error: metricsError } = await supabase
          .from('business_metrics')
          .select('*')
          .eq('id', 'default')
          .single();

        if (metrics && !metricsError) {
          setHealthScore(metrics.health_score || 0);
          setTotalRevenue(metrics.total_revenue || 0);
          setActiveCustomers(metrics.active_customers || 0);
          setMonthlyExpenses(metrics.monthly_expenses || 0);
          setCashFlow(metrics.cash_flow || 0);
          setFinancialScore(metrics.financial_score || 0);
          setInventoryScore(metrics.inventory_score || 0);
          setCustomerScore(metrics.customer_score || 0);
          setGrowthScore(metrics.growth_score || 0);
          setOperationalScore(metrics.operational_score || 0);
          setConfidenceScore(metrics.confidence_score || 0);
          
          const score = metrics.health_score || 0;
          if (score >= 90) setBusinessGrade('Excellent');
          else if (score >= 80) setBusinessGrade('Very Healthy');
          else if (score >= 70) setBusinessGrade('Healthy');
          else if (score >= 60) setBusinessGrade('Average');
          else if (score >= 40) setBusinessGrade('Needs Improvement');
          else setBusinessGrade('Critical');
        }

        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('business_id', 'default')
          .order('created_at', { ascending: false });

        if (docs && !docsError) {
          if (docs.length > 0) {
            setDocuments(docs.map(d => ({
              id: d.id,
              name: d.name,
              type: d.type,
              status: d.status as 'parsing' | 'analyzed',
              dateUploaded: d.date_uploaded,
              day: d.day,
              month: d.month,
              year: d.year
            })));
          }
        }
      } catch (e) {
        console.error('Supabase fetch error, maintaining local storage', e);
        // Since we already initialized from local storage synchronously, we do nothing here on failure.
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchFromSupabase();
  }, []);

  // Sync to Supabase & LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return; // Don't overwrite database with initial state

    const saveToSupabase = async () => {
      // Save metrics
      const { error } = await supabase.from('business_metrics').upsert({
        id: 'default',
        health_score: healthScore,
        total_revenue: totalRevenue,
        active_customers: activeCustomers,
        monthly_expenses: monthlyExpenses,
        cash_flow: cashFlow,
        financial_score: financialScore,
        inventory_score: inventoryScore,
        customer_score: customerScore,
        growth_score: growthScore,
        operational_score: operationalScore,
        confidence_score: confidenceScore
      }, { onConflict: 'id' });
      if (error) console.error(error);
    };

    saveToSupabase();

    // Still save to local storage as backup
    localStorage.setItem('takeover_business_data', JSON.stringify({
      healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents,
      analysisMode, selectedMonth, selectedYear
    }));
  }, [healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents, analysisMode, selectedMonth, selectedYear, isLoaded]);

  const addDocument = async (doc: UploadedDocument) => {
    // We now append to the existing documents to keep a permanent history
    setDocuments(prev => [doc, ...prev]);
    
    // Insert the new document with time fields
    const { error } = await supabase.from('documents').insert({
      id: doc.id,
      business_id: 'default',
      name: doc.name,
      type: doc.type,
      status: doc.status,
      date_uploaded: doc.dateUploaded,
      day: doc.day,
      month: doc.month,
      year: doc.year
    });
    if (error) console.error(error);
  };

  const updateDocumentStatus = async (id: string, status: 'parsing' | 'analyzed') => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status } : doc));
    const { error } = await supabase.from('documents').update({ status }).eq('id', id);
    if (error) console.error(error);
  };

  const updateMetricsFromDocument = () => {
    // We no longer take a fileName parameter. Instead, we recalculate everything based on the current analyzed documents.
  };

  // Recalculate metrics whenever documents change
  useEffect(() => {
    if (!isLoaded) return;
    
    const docsForPeriod = documents.filter(d => {
      if (d.status !== 'analyzed') return false;
      if (analysisMode === 'Monthly') return d.month === selectedMonth && d.year === selectedYear;
      return d.year === selectedYear;
    });

    // Calculate previous period docs
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let prevMonth = selectedMonth;
    let prevYear = selectedYear;
    if (analysisMode === 'Monthly') {
      const currentIdx = MONTHS.indexOf(selectedMonth);
      if (currentIdx === 0) {
        prevMonth = 'December';
        prevYear = selectedYear - 1;
      } else {
        prevMonth = MONTHS[currentIdx - 1];
      }
    } else {
      prevYear = selectedYear - 1;
    }

    const prevDocsForPeriod = documents.filter(d => {
      if (d.status !== 'analyzed') return false;
      if (analysisMode === 'Monthly') return d.month === prevMonth && d.year === prevYear;
      return d.year === prevYear;
    });

    const context = generateIntelligenceContext(docsForPeriod, prevDocsForPeriod);
    setAiContext(context);

    if (context) {
      setTotalRevenue(context.revenue);
      setMonthlyExpenses(context.expenses);
      setActiveCustomers(context.averageRating * 100); // approximated for UI mapping
      setCashFlow(context.cashFlow);
      setHealthScore(context.healthScore); 
      setFinancialScore(context.financialScore);
      setInventoryScore(context.inventoryScore);
      setCustomerScore(context.customerScore);
      setGrowthScore(context.growthScore);
      setOperationalScore(context.operationsScore);
      setConfidenceScore(Math.min(99, 40 + (docsForPeriod.length * 15)));
      setBusinessGrade(context.grade);
    } else {
      setTotalRevenue(0);
      setMonthlyExpenses(0);
      setActiveCustomers(0);
      setCashFlow(0);
      setHealthScore(0);
      setFinancialScore(0);
      setInventoryScore(0);
      setCustomerScore(0);
      setGrowthScore(0);
      setOperationalScore(0);
      setConfidenceScore(0);
      setBusinessGrade('Critical');
    }

    const prevContext = generateIntelligenceContext(prevDocsForPeriod, []);
    if (prevContext) {
      setPrevTotalRevenue(prevContext.revenue);
      setPrevMonthlyExpenses(prevContext.expenses);
      setPrevActiveCustomers(prevContext.averageRating * 100);
      setPrevCashFlow(prevContext.cashFlow);
      setPrevHealthScore(prevContext.healthScore);
      setPrevFinancialScore(prevContext.financialScore);
      setPrevInventoryScore(prevContext.inventoryScore);
      setPrevCustomerScore(prevContext.customerScore);
      setPrevGrowthScore(prevContext.growthScore);
      setPrevOperationalScore(prevContext.operationsScore);
    } else {
      setPrevTotalRevenue(0);
      setPrevMonthlyExpenses(0);
      setPrevActiveCustomers(0);
      setPrevCashFlow(0);
      setPrevHealthScore(0);
      setPrevFinancialScore(0);
      setPrevInventoryScore(0);
      setPrevCustomerScore(0);
      setPrevGrowthScore(0);
      setPrevOperationalScore(0);
    }
  }, [documents, isLoaded, analysisMode, selectedMonth, selectedYear]);
  const removeDocument = async (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    // Delete from Supabase
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) console.error(error);
  };

  const generateSnapshot = async () => {
    const reportId = `report-${Date.now()}`;
    const newReport = {
      id: reportId,
      business_id: 'default',
      analysis_date: new Date().toISOString(),
      selected_period: analysisMode === 'Monthly' ? `${selectedMonth} ${selectedYear}` : `${selectedYear}`,
      health_score: healthScore,
      financial_score: financialScore,
      inventory_score: inventoryScore,
      customer_score: customerScore,
      growth_score: growthScore,
      operational_score: operationalScore,
      confidence_score: confidenceScore,
      executive_summary: `AI Analysis completed for ${analysisMode === 'Monthly' ? selectedMonth : 'Year'} ${selectedYear}. The health score was determined to be ${healthScore}/100 with a ${businessGrade} rating. Key metrics include Total Revenue: ₹${totalRevenue}, Margin/Cash Flow: ₹${cashFlow}, backed by a ${confidenceScore}% confidence interval.`
    };
    const { error } = await supabase.from('ai_reports_history').insert(newReport);
    if (error) console.error(error);
  };

  return (
    <BusinessDataContext.Provider value={{
      healthScore,
      totalRevenue,
      activeCustomers,
      monthlyExpenses,
      cashFlow,
      prevHealthScore,
      prevTotalRevenue,
      prevActiveCustomers,
      prevMonthlyExpenses,
      prevCashFlow,
      financialScore,
      inventoryScore,
      customerScore,
      growthScore,
      operationalScore,
      confidenceScore,
      prevFinancialScore,
      prevInventoryScore,
      prevCustomerScore,
      prevGrowthScore,
      prevOperationalScore,
      businessGrade,
      documents,
      analysisMode,
      selectedMonth,
      selectedYear,
      aiContext,
      setAnalysisMode,
      setSelectedMonth,
      setSelectedYear,
      addDocument,
      updateDocumentStatus,
      updateMetricsFromDocument,
      removeDocument,
      generateSnapshot
    }}>
      {children}
    </BusinessDataContext.Provider>
  );
};

