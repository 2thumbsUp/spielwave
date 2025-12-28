import { useState, useCallback } from 'react';

export const useOptimisticUpdate = (initialData) => {
  const [data, setData] = useState(initialData);
  const [optimisticUpdates, setOptimisticUpdates] = useState([]);
  const [error, setError] = useState(null);

  const update = useCallback(async (optimisticValue, asyncFn, rollbackValue) => {
    const updateId = Date.now();
    
    // Apply optimistic update immediately
    setData(optimisticValue);
    setOptimisticUpdates(prev => [...prev, updateId]);
    setError(null);

    try {
      // Execute async operation
      const result = await asyncFn();
      
      // Remove from pending updates
      setOptimisticUpdates(prev => prev.filter(id => id !== updateId));
      
      return result;
    } catch (err) {
      // Rollback on error
      setData(rollbackValue || initialData);
      setOptimisticUpdates(prev => prev.filter(id => id !== updateId));
      setError(err);
      throw err;
    }
  }, [initialData]);

  const reset = useCallback(() => {
    setData(initialData);
    setOptimisticUpdates([]);
    setError(null);
  }, [initialData]);

  return {
    data,
    setData,
    update,
    reset,
    isPending: optimisticUpdates.length > 0,
    error
  };
};