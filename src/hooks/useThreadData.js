import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useThreadData = (threadId) => {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadThread = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load thread data with stats
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          *,
          users!threads_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          thread_stats (
            views,
            clicks,
            plays,
            shares,
            agrees,
            disagrees,
            replies
          )
        `)
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;
      
      // Process timestamp
      const processedThread = {
        ...threadData,
        created_at: threadData.created_at.endsWith('Z') 
          ? threadData.created_at 
          : threadData.created_at + 'Z'
      };
      
      setThread(processedThread);
      setLoading(false);

    } catch (err) {
      console.error('Error loading thread:', err);
      setError(err);
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const updateStats = useCallback((updates) => {
    setThread(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        thread_stats: {
          ...prev.thread_stats,
          ...updates
        }
      };
    });
  }, []);

  return {
    thread,
    loading,
    error,
    reload: loadThread,
    updateStats
  };
};