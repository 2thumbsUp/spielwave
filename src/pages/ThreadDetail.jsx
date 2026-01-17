import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, User, Flame, Trash2 } from 'lucide-react';
import { VoicePlayer } from '../components/voice/VoicePlayer';
import { VoiceRecorder } from '../components/voice/VoiceRecorder';
import { AgreementMeter } from '../components/thread/AgreementMeter';
import { CATEGORIES } from '../data/categories';
import { formatTimeAgo } from '../utils/formatters';
import { supabase } from '../services/supabase';

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-500">Loading thread...</p>
    </div>
  </div>
);

const ThreadNotFound = ({ onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-lg font-medium text-gray-900">Thread not found</p>
      <button
        onClick={onBack}
        className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
      >
        Go back home
      </button>
    </div>
  </div>
);

export const ThreadDetail = ({ currentUser, onNavigateToProfile }) => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [showReplyRecorder, setShowReplyRecorder] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [posting, setPosting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadThread();
    loadReplies();
  }, [threadId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentUser && threadId) {
      loadUserVote();
    }
  }, [currentUser, threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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

      if (error) throw error;
      
      const processedThread = {
        ...data,
        created_at: data.created_at.endsWith('Z') ? data.created_at : data.created_at + 'Z'
      };
      
      setThread(processedThread);
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
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
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const processedReplies = (data || []).map(reply => ({
        ...reply,
        created_at: reply.created_at.endsWith('Z') ? reply.created_at : reply.created_at + 'Z'
      }));
      
      setReplies(processedReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const loadUserVote = async () => {
    try {
      const { data } = await supabase
        .from('user_votes')
        .select('vote_type')
        .eq('user_id', currentUser.id)
        .eq('thread_id', threadId)
        .maybeSingle();

      setUserVote(data?.vote_type || null);
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const handleVote = async (voteType) => {
    console.log('Vote type:', voteType);
    console.log('Current user:', currentUser?.id);
    
    if (!currentUser) {
      alert('Please sign in to vote');
      return;
    }

    const previousVote = userVote;
    const isRemoving = voteType === previousVote;

    try {
      if (isRemoving) {
        console.log('Removing vote...');
        await supabase
          .from('user_votes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('thread_id', threadId);
        
        setUserVote(null);
      } else {
        console.log('Adding/changing vote...');
        await supabase
          .from('user_votes')
          .upsert({
            user_id: currentUser.id,
            thread_id: threadId,
            vote_type: voteType,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,thread_id'
          });
        
        setUserVote(voteType);
      }

      // Reload thread to get updated stats
      console.log('Reloading thread stats...');
      await loadThread();
      console.log('Vote complete!');

    } catch (error) {
      console.error('Vote error:', error);
      setUserVote(previousVote);
      alert('Failed to vote: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this thread? This cannot be undone.')) return;

    try {
      if (thread.audio_url) {
        const filePath = thread.audio_url.split('/audio-files/')[1];
        if (filePath) {
          await supabase.storage.from('audio-files').remove([filePath]);
        }
      }

      await supabase
        .from('threads')
        .delete()
        .eq('id', threadId)
        .eq('user_id', currentUser.id);

      alert('Thread deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete thread.');
    }
  };

  const handleReplyComplete = async (audioData) => {
    if (!currentUser) {
      alert('Please sign in to reply');
      return;
    }

    setPosting(true);

    try {
      // Upload audio
      const fileName = `${currentUser.id}_${Date.now()}.webm`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, audioData.audioBlob, {
          contentType: audioData.audioBlob.type || 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      // Create reply
      await supabase
        .from('replies')
        .insert([{
          thread_id: threadId,
          user_id: currentUser.id,
          parent_reply_id: replyingTo,
          audio_url: urlData.publicUrl,
          audio_duration: audioData.duration,
          depth: replyingTo ? 1 : 0
        }]);

      // Reload data
      await loadReplies();
      await loadThread();
      
      setShowReplyRecorder(false);
      setReplyingTo(null);
      alert('Reply posted! 🎉');
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!thread) return <ThreadNotFound onBack={() => navigate('/')} />;

  const category = CATEGORIES.find(c => c.id === thread.category);
  const isAuthor = currentUser?.id === thread.user_id;
  const topLevelReplies = replies.filter(r => !r.parent_reply_id);
  const nestedReplies = replies.filter(r => r.parent_reply_id);

  const ReplyCard = ({ reply, depth = 0 }) => {
    const childReplies = nestedReplies.filter(r => r.parent_reply_id === reply.id);
    
    return (
      <div className={`${depth > 0 ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white cursor-pointer"
              onClick={() => onNavigateToProfile?.(reply.users.id)}>
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={() => onNavigateToProfile?.(reply.users.id)}>
                {reply.users.display_name || reply.users.username}
              </div>
              <div className="text-xs text-gray-500">{formatTimeAgo(new Date(reply.created_at).getTime())}</div>
            </div>
          </div>

          <VoicePlayer audioUrl={reply.audio_url} duration={reply.audio_duration} />

          {depth < 2 && currentUser && (
            <button
              onClick={() => {
                setReplyingTo(reply.id);
                setShowReplyRecorder(true);
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Reply
            </button>
          )}
        </div>

        {childReplies.map(childReply => (
          <ReplyCard key={childReply.id} reply={childReply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white cursor-pointer"
              onClick={() => onNavigateToProfile?.(thread.users.id)}>
              <User size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={() => onNavigateToProfile?.(thread.users.id)}>
                {thread.users.display_name || thread.users.username}
              </div>
              <div className="text-sm text-gray-500">{formatTimeAgo(new Date(thread.created_at).getTime())}</div>
            </div>
            <div className="flex items-center gap-2">
              {thread.is_trending && (
                <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center gap-1">
                  <Flame size={12} />
                  Trending
                </div>
              )}
              <div className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                {category?.icon} {category?.name}
              </div>
              {isAuthor && (
                <button onClick={handleDelete} className="p-2 hover:bg-red-100 rounded-full transition-colors group" title="Delete thread">
                  <Trash2 size={18} className="text-gray-400 group-hover:text-red-600" />
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4 text-gray-900">{thread.title}</h1>

          <div className="mb-4">
            <VoicePlayer audioUrl={thread.audio_url} duration={thread.audio_duration} />
          </div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {thread.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 font-medium transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {thread.thread_stats && (
            <div className="mb-6">
              <AgreementMeter agrees={thread.thread_stats.agrees || 0} disagrees={thread.thread_stats.disagrees || 0} />
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleVote('agree')}
              disabled={!currentUser}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                userVote === 'agree'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}>
              <ThumbsUp size={18} />
              <span>Agree</span>
              <span className="text-xs opacity-75">({thread.thread_stats?.agrees || 0})</span>
            </button>
            
            <button
              onClick={() => handleVote('disagree')}
              disabled={!currentUser}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                userVote === 'disagree'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}>
              <ThumbsDown size={18} />
              <span>Disagree</span>
              <span className="text-xs opacity-75">({thread.thread_stats?.disagrees || 0})</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg text-gray-700 text-sm font-medium">
              <MessageCircle size={18} />
              <span>{thread.thread_stats?.replies || 0} replies</span>
            </div>

            {/* View count - coming soon
            <div className="text-sm text-gray-500 ml-auto">
              {thread.thread_stats?.views || 0} views
            </div>
            */}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Replies ({replies.length})</h2>
            {currentUser && !showReplyRecorder && (
              <button onClick={() => { setReplyingTo(null); setShowReplyRecorder(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm text-sm">
                <MessageCircle size={18} />
                Add Reply
              </button>
            )}
          </div>

          {showReplyRecorder && (
            <div id="reply-recorder" className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {replyingTo ? 'Reply to comment' : 'Add your voice reply'}
              </h3>
              {posting ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-700 font-medium">Posting reply...</p>
                </div>
              ) : (
                <VoiceRecorder
                  onComplete={handleReplyComplete}
                  onCancel={() => { setShowReplyRecorder(false); setReplyingTo(null); }}
                  maxDuration={60}
                />
              )}
            </div>
          )}

          {replies.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div>
              {topLevelReplies.map(reply => (
                <ReplyCard key={reply.id} reply={reply} depth={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};