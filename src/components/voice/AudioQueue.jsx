import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';

export const AudioQueue = ({ threads, onClose, onThreadClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  const currentThread = threads[currentIndex];

  useEffect(() => {
    if (!currentThread) return;

    // Create new audio element
    const audio = new Audio(currentThread.audio_url);
    audioRef.current = audio;

    // Auto-play when track changes
    if (isPlaying) {
      audio.play().catch(err => console.error('Autoplay failed:', err));
    }

    // When track ends, play next
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('ended', handleNext);
    };
  }, [currentIndex, currentThread?.id]);

  const handleNext = () => {
    if (currentIndex < threads.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reached end of queue
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!currentThread) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Now Playing Info */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
            Now Playing ({currentIndex + 1}/{threads.length})
          </div>
          <h3 
            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onThreadClick(currentThread.id)}
          >
            {currentThread.title}
          </h3>
          <p className="text-sm text-gray-600">
            by {currentThread.users?.display_name || currentThread.users?.username || 'Unknown'}
          </p>
        </div>

        {/* Custom Audio Player */}
        <VoicePlayer 
          audioUrl={currentThread.audio_url}
          duration={currentThread.audio_duration}
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipForward size={20} className="text-gray-700 rotate-180" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === threads.length - 1}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipForward size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Queue Preview */}
        {currentIndex < threads.length - 1 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Next: {threads[currentIndex + 1].title}
          </div>
        )}
      </div>
    </div>
  );
};