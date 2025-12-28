import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useRepliesData = (threadId, options = {}) => {
  const { 
    initialLimit = 50,
    autoLoad = true 
  } = options;

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadReplies = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      const currentOffset = loadMore ? offset : 0;

      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          users!replies_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .range(currentOffset, currentOffset + initialLimit - 1);

      if (error) throw error;

      // FIX: Process timestamps to ensure UTC parsing
      const processedData = (data || []).map(reply => ({
        ...reply,
        created_at: reply.created_at.endsWith('Z') 
          ? reply.created_at 
          : reply.created_at + 'Z'
      }));

      if (loadMore) {
        setReplies(prev => [...prev, ...processedData]);
      } else {
        setReplies(processedData);
      }

      setHasMore(data?.length === initialLimit);
      setOffset(currentOffset + (data?.length || 0));

    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoading(false);
    }
  }, [threadId, initialLimit, offset]);

  useEffect(() => {
    if (autoLoad) {
      loadReplies();
    }
  }, [autoLoad]); // Only load once on mount

  const addReply = useCallback((newReply) => {
    // Process the new reply timestamp too
    const processedReply = {
      ...newReply,
      created_at: newReply.created_at.endsWith('Z') 
        ? newReply.created_at 
        : newReply.created_at + 'Z'
    };
    setReplies(prev => [...prev, processedReply]);
  }, []);

  const loadMore = useCallback(() => {
    loadReplies(true);
  }, [loadReplies]);

  return {
    replies,
    loading,
    hasMore,
    reload: () => loadReplies(false),
    loadMore,
    addReply
  };
};