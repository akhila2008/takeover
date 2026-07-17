import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateIntelligenceContext } from '../lib/IntelligenceEngine';
import type { AIContextObject, ProductData } from '../lib/IntelligenceEngine';

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

export type AnalysisStage = 'idle' | 'reading' | 'kpis' | 'charts' | 'insights' | 'summary' | 'complete';

export interface AnalysisProgress {
  isAnalyzing: boolean;
  stage: AnalysisStage;
  progressPercent: number;
}


export interface MonthlyFinancialData {
  month: string;
  revenue: number | null;
  expenses: number | null;
  profit: number | null;
  salesGrowth: number | null;
  cashFlow: number | null;
  actual: boolean;
}
export interface InventoryData { name: string; value: number; color: string; }
export interface CustomerData { month: string; new: number | null; returning: number | null; }
export interface RevenueSourceData { name: string; value: number; color: string; }
export type TopProductData = ProductData;

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
  monthlyChartData: MonthlyFinancialData[];
  inventoryChartData: InventoryData[];
  customerChartData: CustomerData[];
  revenueSourcesData: RevenueSourceData[];
  topProductsData: TopProductData[];
  isLoaded: boolean;
  setAnalysisMode: (mode: 'Monthly' | 'Annual') => void;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
  addDocument: (doc: UploadedDocument) => void;
  updateDocumentStatus: (id: string, status: 'parsing' | 'analyzed') => void;
  updateMetricsFromDocument: (fileName: string) => void;
  removeDocument: (id: string) => void;
  generateSnapshot: () => void;
  analysisProgress: AnalysisProgress;
  setAnalysisProgress: React.Dispatch<React.SetStateAction<AnalysisProgress>>;
  beginAnalysis: (newDoc?: UploadedDocument) => void;
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
  monthlyChartData: [],
  inventoryChartData: [],
  customerChartData: [],
  revenueSourcesData: [],
  topProductsData: [],
  isLoaded: false,
  analysisProgress: { isAnalyzing: false, stage: 'idle', progressPercent: 0 },
  setAnalysisProgress: () => {},
  setAnalysisMode: () => {},
  setSelectedMonth: () => {},
  setSelectedYear: () => {},
  addDocument: () => {},
  updateDocumentStatus: () => {},
  updateMetricsFromDocument: () => {},
  removeDocument: () => {},
  generateSnapshot: () => {},
  beginAnalysis: () => {}
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({ isAnalyzing: false, stage: 'idle', progressPercent: 0 });

  const [aiContext, setAiContext] = useState<AIContextObject | null>(() => {
    return savedData && savedData.aiContext ? savedData.aiContext : defaultState.aiContext;
  });
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyFinancialData[]>(() => {
    return savedData && savedData.monthlyChartData ? savedData.monthlyChartData : defaultState.monthlyChartData;
  });
  const [inventoryChartData, setInventoryChartData] = useState<InventoryData[]>(() => {
    return savedData && savedData.inventoryChartData ? savedData.inventoryChartData : defaultState.inventoryChartData;
  });
  const [customerChartData, setCustomerChartData] = useState<CustomerData[]>(() => {
    return savedData && savedData.customerChartData ? savedData.customerChartData : defaultState.customerChartData;
  });
  const [revenueSourcesData, setRevenueSourcesData] = useState<RevenueSourceData[]>(() => {
    return savedData && savedData.revenueSourcesData ? savedData.revenueSourcesData : defaultState.revenueSourcesData;
  });
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>(() => {
    return savedData && savedData.topProductsData ? savedData.topProductsData : defaultState.topProductsData;
  });

  // Load analysis for the current period from cache instead of regenerating
  useEffect(() => {
    if (!isLoaded) return;
    
    const loadCachedAnalysis = async () => {
      const periodId = analysisMode === 'Monthly' ? `Monthly-${selectedMonth}-${selectedYear}` : `Annual-${selectedYear}`;
      
      try {
        const { data, error } = await supabase
          .from('ai_analysis_cache')
          .select('*')
          .eq('id', periodId)
          .single();

        if (data && !error && data.status === 'completed') {
          console.log("[Cache] Loaded analysis from Supabase for", periodId);
          if (data.metrics) {
             setHealthScore(data.metrics.healthScore || 0);
             setTotalRevenue(data.metrics.totalRevenue || 0);
             setActiveCustomers(data.metrics.activeCustomers || 0);
             setMonthlyExpenses(data.metrics.monthlyExpenses || 0);
             setCashFlow(data.metrics.cashFlow || 0);
             setFinancialScore(data.metrics.financialScore || 0);
             setInventoryScore(data.metrics.inventoryScore || 0);
             setCustomerScore(data.metrics.customerScore || 0);
             setGrowthScore(data.metrics.growthScore || 0);
             setOperationalScore(data.metrics.operationalScore || 0);
             setConfidenceScore(data.metrics.confidenceScore || 0);
             setBusinessGrade(data.metrics.businessGrade || 'Critical');
          }
          if (data.charts) {
             setMonthlyChartData(data.charts.monthlyChartData || []);
             setInventoryChartData(data.charts.inventoryChartData || []);
             setCustomerChartData(data.charts.customerChartData || []);
             setRevenueSourcesData(data.charts.revenueSourcesData || []);
             setTopProductsData(data.charts.topProductsData || []);
          }
          if (data.ai_output) {
             setAiContext(data.ai_output.aiContext || null);
          }
        } else {
          console.log("[Cache] No cache found or Supabase error for", periodId, "error:", error?.message);
          
          // Check if we have documents locally for this period
          const currentDocsForPeriod = documents.filter(d => {
            if (analysisMode === 'Monthly') return d.month === selectedMonth && d.year === selectedYear;
            return d.year === selectedYear;
          });

          if (currentDocsForPeriod.length > 0) {
            console.log("[Cache] Local documents found, regenerating analysis...");
            runAnalysisPipeline(documents);
          } else {
            console.log("[Cache] No local documents found, resetting view.");
            setAiContext(null);
            setTotalRevenue(0);
            setHealthScore(0);
          }
        }
      } catch (err) {
        console.error("Failed to load cached analysis", err);
      }
    };
    
    loadCachedAnalysis();
  }, [selectedMonth, selectedYear, analysisMode, isLoaded]);

  const runAnalysisPipeline = (currentDocs: UploadedDocument[]) => {
    // 1. Determine period docs
    const currentDocsForPeriod = currentDocs.filter(d => {
      if (d.status !== 'analyzed') return false;
      if (analysisMode === 'Monthly') return d.month === selectedMonth && d.year === selectedYear;
      return d.year === selectedYear;
    });

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let pMonth = selectedMonth;
    let pYear = selectedYear;
    if (analysisMode === 'Monthly') {
      const currentIdx = MONTHS.indexOf(selectedMonth);
      if (currentIdx === 0) {
        pMonth = 'December';
        pYear = selectedYear - 1;
      } else {
        pMonth = MONTHS[currentIdx - 1];
      }
    } else {
      pYear = selectedYear - 1;
    }

    const prevDocsForPeriod = currentDocs.filter(d => {
      if (d.status !== 'analyzed') return false;
      if (analysisMode === 'Monthly') return d.month === pMonth && d.year === pYear;
      return d.year === pYear;
    });

    // 2. Generate Intelligence Context
    const newAiContext = generateIntelligenceContext(currentDocsForPeriod, prevDocsForPeriod, selectedMonth, selectedYear);
    
    // 3. Generate Charts
    const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyFinancials: MonthlyFinancialData[] = [];
    const customerAcq: CustomerData[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthShort = MONTHS_SHORT[i];
      const monthFull = MONTHS[i];
      const docsForThisMonth = currentDocs.filter(d => d.status === 'analyzed' && d.month === monthFull && d.year === selectedYear);
      
      if (docsForThisMonth.length > 0) {
        const prevMonthFull = i === 0 ? 'December' : MONTHS[i-1];
        const prevYr = i === 0 ? selectedYear - 1 : selectedYear;
        const docsForPrev = currentDocs.filter(d => d.status === 'analyzed' && d.month === prevMonthFull && d.year === prevYr);
        
        const ctx = generateIntelligenceContext(docsForThisMonth, docsForPrev, monthFull, selectedYear);
        if (ctx) {
          monthlyFinancials.push({ month: monthShort, revenue: ctx.revenue, expenses: ctx.expenses, profit: ctx.revenue - ctx.expenses, salesGrowth: ctx.revenueGrowth, cashFlow: ctx.cashFlow, actual: true });
          customerAcq.push({ month: monthShort, new: ctx.newCustomers, returning: ctx.returningCustomers });
        }
      } else {
        monthlyFinancials.push({ month: monthShort, revenue: null, expenses: null, profit: null, salesGrowth: null, cashFlow: null, actual: false });
        customerAcq.push({ month: monthShort, new: null, returning: null });
      }
    }

    let inv: InventoryData[] = newAiContext?.inventoryChartData || [];
    let revSrc: RevenueSourceData[] = newAiContext?.revenueSources || [];
    let topProd: TopProductData[] = newAiContext?.topProducts || [];

    setAiContext(newAiContext);
    setMonthlyChartData(monthlyFinancials);
    setCustomerChartData(customerAcq);
    setInventoryChartData(inv);
    setRevenueSourcesData(revSrc);
    setTopProductsData(topProd);

    // Sync scalar metrics
    if (newAiContext) {
      setTotalRevenue(newAiContext.revenue);
      setMonthlyExpenses(newAiContext.expenses);
      setActiveCustomers(newAiContext.activeCustomers);
      setCashFlow(newAiContext.cashFlow);
      setHealthScore(newAiContext.healthScore);
      setFinancialScore(newAiContext.financialScore);
      setInventoryScore(newAiContext.inventoryScore);
      setCustomerScore(newAiContext.customerScore);
      setGrowthScore(newAiContext.growthScore);
      setOperationalScore(newAiContext.operationsScore);
      setConfidenceScore(Math.min(99, 40 + (currentDocsForPeriod.length * 15)));
      setBusinessGrade(newAiContext.grade);
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

    const prevAiContext = generateIntelligenceContext(prevDocsForPeriod, [], pMonth, pYear);
    if (prevAiContext) {
      setPrevTotalRevenue(prevAiContext.revenue);
      setPrevMonthlyExpenses(prevAiContext.expenses);
      setPrevActiveCustomers(prevAiContext.activeCustomers);
      setPrevCashFlow(prevAiContext.cashFlow);
      setPrevHealthScore(prevAiContext.healthScore);
      setPrevFinancialScore(prevAiContext.financialScore);
      setPrevInventoryScore(prevAiContext.inventoryScore);
      setPrevCustomerScore(prevAiContext.customerScore);
      setPrevGrowthScore(prevAiContext.growthScore);
      setPrevOperationalScore(prevAiContext.operationsScore);
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

    // --- NEW: Persist to ai_analysis_cache ---
    const persistToCache = async () => {
      const periodId = analysisMode === 'Monthly' ? `Monthly-${selectedMonth}-${selectedYear}` : `Annual-${selectedYear}`;
      const docHashes = currentDocsForPeriod.map(d => d.hash).filter(Boolean);
      
      const payload = {
        id: periodId,
        business_id: 'default',
        document_hashes: docHashes,
        metrics: {
          healthScore: newAiContext?.healthScore || 0,
          totalRevenue: newAiContext?.revenue || 0,
          activeCustomers: newAiContext ? (newAiContext.averageRating * 100) : 0,
          monthlyExpenses: newAiContext?.expenses || 0,
          cashFlow: newAiContext?.cashFlow || 0,
          financialScore: newAiContext?.financialScore || 0,
          inventoryScore: newAiContext?.inventoryScore || 0,
          customerScore: newAiContext?.customerScore || 0,
          growthScore: newAiContext?.growthScore || 0,
          operationalScore: newAiContext?.operationsScore || 0,
          confidenceScore: Math.min(99, 40 + (currentDocsForPeriod.length * 15)),
          businessGrade: newAiContext?.grade || 'Critical'
        },
        charts: {
          monthlyChartData: monthlyFinancials,
          inventoryChartData: inv,
          customerChartData: customerAcq,
          revenueSourcesData: revSrc,
          topProductsData: topProd
        },
        ai_output: {
          aiContext: newAiContext
        },
        status: 'completed',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('ai_analysis_cache').upsert(payload, { onConflict: 'id' });
      if (error) console.error("Failed to cache analysis:", error);
      else console.log("[Cache] Saved generated analysis to Supabase");
    };
    
    persistToCache();
  };

  const beginAnalysis = async (newDoc?: UploadedDocument) => {
    // Generate right now using the known context
    let updatedDocs = [...documents];
    if (newDoc && !documents.find(d => d.id === newDoc.id)) {
      updatedDocs = [newDoc, ...documents];
    }
    
    // Auto-mark new doc as analyzed if not already
    if (newDoc) {
      updatedDocs = updatedDocs.map(d => d.id === newDoc.id ? { ...d, status: 'analyzed' } : d);
    }

    // Hash check to prevent unnecessary re-analysis
    const currentDocsForPeriod = updatedDocs.filter(d => {
      if (analysisMode === 'Monthly') return d.month === selectedMonth && d.year === selectedYear;
      return d.year === selectedYear;
    });
    
    const newHashes = currentDocsForPeriod.map(d => d.hash).filter(Boolean) as string[];
    const periodId = analysisMode === 'Monthly' ? `Monthly-${selectedMonth}-${selectedYear}` : `Annual-${selectedYear}`;
    
    try {
      const { data } = await supabase.from('ai_analysis_cache').select('document_hashes').eq('id', periodId).single();
      if (data && data.document_hashes) {
        const existingHashes = data.document_hashes as string[];
        const isSubset = newHashes.every(h => existingHashes.includes(h));
        if (isSubset && newHashes.length === existingHashes.length && newHashes.length > 0) {
          console.log("[Cache] Documents match exactly, skipping AI re-analysis.");
          // Update UI to just instantly complete if we called this manually
          setAnalysisProgress({ isAnalyzing: false, stage: 'complete', progressPercent: 100 });
          return;
        }
      }
    } catch (e) {
      // Ignored
    }
    
    runAnalysisPipeline(updatedDocs);

    // Run UI progressive loading state
    setAnalysisProgress({ isAnalyzing: true, stage: 'reading', progressPercent: 10 });
    setTimeout(() => setAnalysisProgress({ isAnalyzing: true, stage: 'kpis', progressPercent: 30 }), 1500);
    setTimeout(() => setAnalysisProgress({ isAnalyzing: true, stage: 'charts', progressPercent: 60 }), 3000);
    setTimeout(() => setAnalysisProgress({ isAnalyzing: true, stage: 'insights', progressPercent: 80 }), 4500);
    setTimeout(() => setAnalysisProgress({ isAnalyzing: true, stage: 'summary', progressPercent: 95 }), 6000);
    setTimeout(() => setAnalysisProgress({ isAnalyzing: false, stage: 'complete', progressPercent: 100 }), 8500);
  };

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

    // Save to Supabase (attempt to save full analysis JSON as well if table supports it, else we rely on local storage for now until schema is fully migrated)
    const saveToSupabase = async () => {
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
      
      // We also attempt to save the deep analysis state to a new table `business_analysis`
      try {
        await supabase.from('business_analysis').upsert({
          id: 'default',
          ai_context: aiContext,
          monthly_chart: monthlyChartData,
          inventory_chart: inventoryChartData,
          customer_chart: customerChartData,
          revenue_chart: revenueSourcesData,
          top_products: topProductsData
        }, { onConflict: 'id' });
      } catch (e) {
        // catch error silently if table doesn't exist yet
      }
    };

    saveToSupabase();

    localStorage.setItem('takeover_business_data', JSON.stringify({
      healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents,
      analysisMode, selectedMonth, selectedYear,
      aiContext, monthlyChartData, inventoryChartData, customerChartData, revenueSourcesData, topProductsData
    }));
  }, [
    healthScore, totalRevenue, activeCustomers, monthlyExpenses, cashFlow, documents, 
    analysisMode, selectedMonth, selectedYear, isLoaded, 
    aiContext, monthlyChartData, inventoryChartData, customerChartData, revenueSourcesData, topProductsData
  ]);

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
    setDocuments(prev => {
      const newDocs = prev.map(doc => doc.id === id ? { ...doc, status } : doc);
      return newDocs;
    });
    const { error } = await supabase.from('documents').update({ status }).eq('id', id);
    if (error) console.error(error);
  };

  const updateMetricsFromDocument = () => {
    // We no longer take a fileName parameter. Instead, we recalculate everything based on the current analyzed documents.
  };

  const removeDocument = async (id: string) => {
    setDocuments(prev => {
      const newDocs = prev.filter(doc => doc.id !== id);
      return newDocs;
    });
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
      monthlyChartData,
      inventoryChartData,
      customerChartData,
      revenueSourcesData,
      topProductsData,
      isLoaded,
      setAnalysisMode,
      setSelectedMonth,
      setSelectedYear,
      addDocument,
      updateDocumentStatus,
      updateMetricsFromDocument,
      removeDocument,
      generateSnapshot,
      analysisProgress,
      setAnalysisProgress,
      beginAnalysis
    }}>
      {children}
    </BusinessDataContext.Provider>
  );
};
