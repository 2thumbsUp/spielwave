import { createClient } from '@supabase/supabase-js';

// Replace these with your actual credentials from Supabase dashboard
const supabaseUrl = 'https://xduxyqfxwsylyuldsivf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdXh5cWZ4d3N5bHl1bGRzaXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODEyNDcsImV4cCI6MjA4MDk1NzI0N30.-SLNVvXgqkeyK5bCI8iy_UMo9eRZCKFvvHSJOr0t_ZQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload audio to Supabase Storage
export const uploadAudio = async (audioBlob, userId) => {
  try {
    console.log('Starting audio upload...', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      userId
    });

    const fileName = `${userId}_${Date.now()}.webm`;
    const filePath = `audio/${fileName}`;

    console.log('Uploading to path:', filePath);

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filePath, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

// Helper function to create thread with stats
export const createThread = async (threadData) => {
  try {
    console.log('Creating thread with data:', threadData);

    // Insert thread
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .insert([threadData])
      .select()
      .single();

    if (threadError) {
      console.error('Thread creation error:', threadError);
      throw threadError;
    }

    console.log('Thread created successfully:', thread);

    // Wait a moment for trigger to create stats
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get thread stats
    const { data: stats, error: statsError } = await supabase
      .from('thread_stats')
      .select('*')
      .eq('thread_id', thread.id)
      .single();

    if (statsError) {
      console.error('Stats fetch error:', statsError);
    }

    return { ...thread, stats };
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

// Helper function to get threads with user info and stats
export const getThreads = async (category = null, limit = 20) => {
  try {
    let query = supabase
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
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
};

// Helper function to vote on thread
export const voteOnThread = async (userId, threadId, voteType) => {
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .upsert(
        {
          user_id: userId,
          thread_id: threadId,
          vote_type: voteType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,thread_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
};

// Helper function to remove vote
export const removeVote = async (userId, threadId) => {
  try {
    const { error } = await supabase
      .from('user_votes')
      .delete()
      .eq('user_id', userId)
      .eq('thread_id', threadId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
};

// Helper function to get user's votes
export const getUserVotes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .select('thread_id, vote_type')
      .eq('user_id', userId);

    if (error) throw error;

    // Convert to object for easy lookup
    const votesMap = {};
    data.forEach((vote) => {
      votesMap[vote.thread_id] = vote.vote_type;
    });

    return votesMap;
  } catch (error) {
    console.error('Error fetching user votes:', error);
    throw error;
  }
};

// Helper function to delete thread (and its audio file)
export const deleteThread = async (threadId, audioUrl, userId) => {
  try {
    console.log('Deleting thread:', threadId);

    // First, delete the audio file from storage
    if (audioUrl) {
      const filePath = audioUrl.split('/audio-files/')[1]; // Extract path from URL
      
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('audio-files')
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting audio file:', storageError);
          // Continue with thread deletion even if file delete fails
        } else {
          console.log('Audio file deleted successfully');
        }
      }
    }

    // Delete the thread (stats will cascade delete automatically)
    const { error: threadError } = await supabase
      .from('threads')
      .delete()
      .eq('id', threadId)
      .eq('user_id', userId); // Ensure user can only delete their own threads

    if (threadError) throw threadError;

    console.log('Thread deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
};