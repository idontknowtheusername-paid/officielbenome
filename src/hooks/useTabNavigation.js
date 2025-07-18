import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useTabNavigation = (defaultTab = 'dashboard') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return {
    activeTab,
    handleTabChange,
    setActiveTab
  };
}; 