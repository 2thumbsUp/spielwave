import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Plus, X, LogIn, LogOut } from 'lucide-react';
import { ThreadCard } from './components/thread/ThreadCard';
import { CategoryFilter } from './components/layout/CategoryFilter';
import { VoiceRecorder } from './components/voice/VoiceRecorder';
import { ThreadDetail } from './pages/ThreadDetail';
import { CATEGORIES } from './data/categories';
import { calculateScore } from './utils/formatters';
import { 
  supabase, 
  uploadAudio, 
  createThread, 
  getThreads, 
  voteOnThread, 
  removeVote, 
  getUserVotes,
  deleteThread 
} from './services/supabase';
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from './services/auth';

// Home Feed Component
function HomeFeed({ 
  currentUser, 
  threads, 
  loading, 
  selectedCategory, 
  setSelectedCategory, 
  sortBy, 
  setSortBy, 
  searchQuery, 
  setSearchQuery, 
  userVotes, 
  handleVote, 
  handleDeleteThread,
  onThreadClick 
}) {
  const getFilteredThreads = () => {
    let filtered = threads;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (sortBy === 'trending') {
      filtered = [...filtered].sort((a, b) => {
        const scoreA = calculateScore({
          createdAt: new Date(a.created_at).getTime(),
          stats: a.thread_stats
        });
        const scoreB = calculateScore({
          createdAt: new Date(b.created_at).getTime(),
          stats: b.thread_stats
        });
        return scoreB - scoreA;
      });
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    }

    return filtered;
  };

  const filteredThreads = getFilteredThreads();

  return (
    <main className="pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Filters */}
        <div className="mb-6">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory
              ? CATEGORIES.find(c => c.id === selectedCategory)?.name
              : 'All Threads'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                sortBy === 'trending'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={16} />
              Trending
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                sortBy === 'newest'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500">Loading threads...</p>
          </div>
        ) : (
          <>
            {/* Thread Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredThreads.map(thread => (
                <ThreadCard
                  key={thread.id}
                  thread={{
                    id: thread.id,
                    title: thread.title,
                    contentType: thread.content_type,
                    content: {
                      audioUrl: thread.audio_url,
                      duration: thread.audio_duration
                    },
                    category: thread.category,
                    tags: thread.tags || [],
                    author: {
                      id: thread.user_id,
                      name: thread.users?.display_name || thread.users?.username || 'Unknown',
                      avatar: thread.users?.avatar_url,
                      isVerified: thread.users?.is_verified || false
                    },
                    stats: thread.thread_stats || {
                      views: 0,
                      agrees: 0,
                      disagrees: 0,
                      replies: 0
                    },
                    // FIX: Add 'Z' to force UTC parsing
                    createdAt: new Date(thread.created_at + 'Z').getTime(),
                    isTrending: thread.is_trending || false
                  }}
                  currentUserId={currentUser?.id}
                  onAgree={(id) => handleVote(id, 'agree')}
                  onDisagree={(id) => handleVote(id, 'disagree')}
                  onDelete={handleDeleteThread}
                  userVote={userVotes[thread.id]}
                  onClick={() => onThreadClick(thread.id)}
                />
              ))}
            </div>

            {filteredThreads.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-medium">No threads found</p>
                <p className="text-sm mt-2">
                  {currentUser ? 'Be the first to post!' : 'Sign in to create threads'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// Main App Component
function AppContent() {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('trending');
  const [showNewThread, setShowNewThread] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [threads, setThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadUser();
    loadThreads();

    const { data: authListener } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user) {
          const votes = await getUserVotes(user.id);
          setUserVotes(votes);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserVotes({});
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadThreads();
  }, [selectedCategory]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const votes = await getUserVotes(user.id);
      setUserVotes(votes);
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = await getThreads(selectedCategory, 50);
      setThreads(data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'signup') {
        await signUp(email, password, username);
        alert('Account created! Please check your email to verify.');
      } else {
        await signIn(email, password);
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleVote = async (threadId, voteType) => {
    if (!currentUser) {
      alert('Please sign in to vote');
      return;
    }

    const currentVote = userVotes[threadId];
  
    try {
      const isRemoving = voteType === currentVote;

      if (isRemoving) {
        // Remove vote
        await removeVote(currentUser.id, threadId);
        setUserVotes({ ...userVotes, [threadId]: null });
      } else {
        // Add or change vote
        await voteOnThread(currentUser.id, threadId, voteType);
        setUserVotes({ ...userVotes, [threadId]: voteType });
      }

      // Reload threads to get updated stats from database
      await loadThreads();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!currentUser) return;

    try {
      const thread = threads.find(t => t.id === threadId);
    
      if (!thread) {
        alert('Thread not found');
        return;
      }

      if (thread.user_id !== currentUser.id) {
        alert('You can only delete your own threads');
        return;
      }

      await deleteThread(threadId, thread.audio_url, currentUser.id);
      setThreads(threads.filter(t => t.id !== threadId));
      alert('Thread deleted successfully');
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread. Please try again.');
    }
  };

  const handleNewThreadComplete = async (audioData) => {
    if (!currentUser) {
      alert('Please sign in to create threads');
      return;
    }

    if (!newThreadTitle.trim() || !newThreadCategory) {
      alert('Please add a title and select a category');
      return;
    }

    setCreating(true);

    try {
      const audioUrl = await uploadAudio(audioData.audioBlob, currentUser.id);

      const threadData = {
        user_id: currentUser.id,
        title: newThreadTitle,
        category: newThreadCategory,
        content_type: 'voice',
        audio_url: audioUrl,
        audio_duration: audioData.duration,
        tags: [],
      };

      await createThread(threadData);
      await loadThreads();

      setShowNewThread(false);
      setNewThreadTitle('');
      setNewThreadCategory('');
      alert('Thread posted successfully! 🎉');
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleThreadClick = (threadId) => {
    navigate(`/thread/${threadId}`);
  };

  // ADD THIS: Reload data when navigating back to home
  useEffect(() => {
    // Reload threads and votes when we're on the home page
    if (window.location.pathname === '/') {
      loadThreads();
      if (currentUser) {
        loadUserVotes();
      }
    }
  }, [window.location.pathname]);

  // Create loadUserVotes function if it doesn't exist
  const loadUserVotes = async () => {
    if (!currentUser) return;
    const votes = await getUserVotes(currentUser.id);
    setUserVotes(votes);
  };

  const handleNavigateToProfile = (userId) => {
    // TODO: Implement when user profiles are ready
    console.log('Navigate to profile:', userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent cursor-pointer"
            >
              SpielWave
            </h1>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowNewThread(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    <Plus size={18} />
                    New Thread
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        @{currentUser.username}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={18} className="text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route 
          path="/" 
          element={
            <HomeFeed
              currentUser={currentUser}
              threads={threads}
              loading={loading}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userVotes={userVotes}
              handleVote={handleVote}
              handleDeleteThread={handleDeleteThread}
              onThreadClick={handleThreadClick}
            />
          } 
        />
        <Route 
          path="/thread/:threadId" 
          element={
            <ThreadDetail 
              currentUser={currentUser}
              onNavigateToProfile={handleNavigateToProfile}
            />
          } 
        />
      </Routes>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Thread</h2>
                <button
                  onClick={() => {
                    if (!creating) {
                      setShowNewThread(false);
                      setNewThreadTitle('');
                      setNewThreadCategory('');
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={creating}
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Thread title..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  disabled={creating}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:opacity-50"
                />

                <select 
                  value={newThreadCategory}
                  onChange={(e) => setNewThreadCategory(e.target.value)}
                  disabled={creating}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 disabled:opacity-50"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>

                {creating ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-700 font-medium">Uploading your spiel...</p>
                  </div>
                ) : (
                  <VoiceRecorder
                    onComplete={handleNewThreadComplete}
                    onCancel={() => {
                      setShowNewThread(false);
                      setNewThreadTitle('');
                      setNewThreadCategory('');
                    }}
                    maxDuration={90}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;