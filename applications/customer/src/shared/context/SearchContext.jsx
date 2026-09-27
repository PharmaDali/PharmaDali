import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submitSignal, setSubmitSignal] = useState(0);

  // Called when user presses the keyboard search/return key
  const triggerSubmit = useCallback(() => {
    setSubmitSignal((n) => n + 1);
  }, []);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, submitSignal, triggerSubmit }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
