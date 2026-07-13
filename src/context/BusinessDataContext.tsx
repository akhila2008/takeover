import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: 'parsing' | 'analyzed';
  dateUploaded: string;
}

interface BusinessDataState {
  healthScore: number;
  totalRevenue: number;
  activeCustomers: number;
  monthlyExpenses: number;
  cashFlow: number;
  documents: UploadedDocument[];
  addDocument: (doc: UploadedDocument) => void;
  updateDocumentStatus: (id: string, status: 'parsing' | 'analyzed') => void;
  updateMetricsFromDocument: (fileName: string) => void;
}

const defaultState: BusinessDataState = {
  healthScore: 92,
  totalRevenue: 2400000,
  activeCustomers: 12450,
  monthlyExpenses: 800000,
  cashFlow: 1600000,
  documents: [],
  addDocument: () => {},
  updateDocumentStatus: () => {},
  updateMetricsFromDocument: () => {}
};

const BusinessDataContext = createContext<BusinessDataState>(defaultState);

export const useBusinessData = () => useContext(BusinessDataContext);

export const BusinessDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [healthScore, setHealthScore] = useState(defaultState.healthScore);
  const [totalRevenue, setTotalRevenue] = useState(defaultState.totalRevenue);
  const [activeCustomers, setActiveCustomers] = useState(defaultState.activeCustomers);
  const [monthlyExpenses, setMonthlyExpenses] = useState(defaultState.monthlyExpenses);
  const [cashFlow, setCashFlow] = useState(defaultState.cashFlow);
  const [documents, setDocuments] = useState<UploadedDocument[]>(defaultState.documents);

  const addDocument = (doc: UploadedDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const updateDocumentStatus = (id: string, status: 'parsing' | 'analyzed') => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status } : doc));
  };

  const updateMetricsFromDocument = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('sales') || lowerName.includes('revenue')) {
      const boost = Math.floor(Math.random() * 200000) + 100000;
      setTotalRevenue(prev => prev + boost);
      setCashFlow(prev => prev + boost);
      setHealthScore(prev => Math.min(100, prev + 1));
    } else if (lowerName.includes('expense') || lowerName.includes('cost')) {
      const increase = Math.floor(Math.random() * 50000) + 20000;
      setMonthlyExpenses(prev => prev + increase);
      setCashFlow(prev => prev - increase);
      setHealthScore(prev => Math.max(0, prev - 1));
    } else if (lowerName.includes('customer') || lowerName.includes('client')) {
      const newCusts = Math.floor(Math.random() * 500) + 100;
      setActiveCustomers(prev => prev + newCusts);
      setHealthScore(prev => Math.min(100, prev + 2));
    } else {
      setHealthScore(prev => Math.min(100, prev + 1));
    }
  };

  return (
    <BusinessDataContext.Provider value={{
      healthScore,
      totalRevenue,
      activeCustomers,
      monthlyExpenses,
      cashFlow,
      documents,
      addDocument,
      updateDocumentStatus,
      updateMetricsFromDocument
    }}>
      {children}
    </BusinessDataContext.Provider>
  );
};
