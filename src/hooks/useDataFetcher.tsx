import { useState, useEffect, useCallback } from 'react';
import { coreDataService } from '@/services/coreDataService';

interface UseDataFetcherOptions {
  autoFetch?: boolean;
  dependencies?: any[];
}

export function useDataFetcher<T>(
  fetchFn: () => Promise<{ success: boolean; data: T; message?: string }>,
  options: UseDataFetcherOptions = {}
) {
  const { autoFetch = true, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    setData
  };
}