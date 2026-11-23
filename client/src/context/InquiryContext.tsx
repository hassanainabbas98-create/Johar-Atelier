import React, { createContext, useContext, useState } from 'react';
import type { InquiryType } from '../types';

export interface InquiryModalContext {
  artworkId?: number;
  artworkTitle?: string;
  catalogReference?: string;
  inquiryType?: InquiryType;
  mediumPreference?: string;
}

interface InquiryContextValue {
  isOpen: boolean;
  contextData: InquiryModalContext | null;
  openInquiry: (data?: InquiryModalContext) => void;
  closeInquiry: () => void;
}

const InquiryContext = createContext<InquiryContextValue | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<InquiryModalContext | null>(null);

  const openInquiry = (data?: InquiryModalContext) => {
    setContextData(data || null);
    setIsOpen(true);
  };

  const closeInquiry = () => {
    setIsOpen(false);
    setContextData(null);
  };

  return (
    <InquiryContext.Provider
      value={{
        isOpen,
        contextData,
        openInquiry,
        closeInquiry,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = (): InquiryContextValue => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};
