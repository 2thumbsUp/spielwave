import { useCallback } from 'react';
import { supabase, uploadAudio, voteOnThread as apiVote, removeVote as apiRemove, deleteThread as apiDelete } from '../services/supabase';

export const useThreadActions = (currentUser) => {
  const vote = useCallback(async (threadId, voteType, currentVote, optimisticCallback) => {
    if (!currentUser) {
      throw new Error('Must be signed in to vote');
    }

    // Calculate the stat changes based on the vote action
    const isRemoving = voteType === currentVote;
    const isChanging = currentVote && voteType !== currentVote;

    let agreeChange = 0;
    let disagreeChange = 0;

    if (isRemoving) {
      // User is removing their vote
      if (currentVote === 'agree') {
        agreeChange = -1;
      } else {
        disagreeChange = -1;
      }
    } else if (isChanging) {
      // User is changing from one vote to another
      if (currentVote === 'agree') {
        agreeChange = -1;    // Remove the agree
        disagreeChange = 1;  // Add disagree
      } else {
        disagreeChange = -1; // Remove the disagree
        agreeChange = 1;     // Add agree
      }
    } else {
      // User is adding a new vote (had no vote before)
      if (voteType === 'agree') {
        agreeChange = 1;
      } else {
        disagreeChange = 1;
      }
    }

    // Apply optimistic update immediately
    if (optimisticCallback) {
      optimisticCallback({
        agreeChange,
        disagreeChange
      });
    }

    // Execute the actual API call
    try {
      if (isRemoving) {
        // Remove the vote from database
        await apiRemove(currentUser.id, threadId);
        return null; // User now has no vote
      } else {
        // Add or change vote in database
        await apiVote(currentUser.id, threadId, voteType);
        return voteType; // User's new vote
      }
    } catch (error) {
      // Error will trigger rollback in the component
      throw error;
    }
  }, [currentUser]);

  const postReply = useCallback(async (threadId, audioData, parentReplyId = null) => {
    if (!currentUser) {
      throw new Error('Must be signed in to reply');
    }

    // Upload audio
    const audioUrl = await uploadAudio(audioData.audioBlob, currentUser.id);

    // Create reply
    const { data, error } = await supabase
      .from('replies')
      .insert([{
        thread_id: threadId,
        user_id: currentUser.id,
        parent_reply_id: parentReplyId,
        audio_url: audioUrl,
        audio_duration: audioData.duration,
        depth: parentReplyId ? 1 : 0
      }])
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
      .single();

    if (error) throw error;

    return data;
  }, [currentUser]);

  const deleteThread = useCallback(async (threadId, audioUrl) => {
    if (!currentUser) {
      throw new Error('Must be signed in to delete');
    }

    await apiDelete(threadId, audioUrl, currentUser.id);
  }, [currentUser]);

  return {
    vote,
    postReply,
    deleteThread
  };
};