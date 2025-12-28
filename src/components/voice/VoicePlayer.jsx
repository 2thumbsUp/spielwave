import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const VoicePlayer = ({ audioUrl, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [actualDuration, setActualDuration] = useState(duration || 0);
  
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set initial duration from prop
      if (duration && Number.isFinite(duration)) {
        setActualDuration(duration);
      }
      
      // Update duration when audio metadata loads
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && Number.isFinite(audio.duration)) {
          setActualDuration(audio.duration);
        }
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration && Number.isFinite(audio.duration)) {
          const progressPercent = (audio.currentTime / audio.duration) * 100;
          setProgress(progressPercent);
          setCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioUrl, duration]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(percent * 100);
    setCurrentTime(newTime);
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  // Ensure we always have a valid duration to display
  const displayDuration = Number.isFinite(actualDuration) && actualDuration > 0 
    ? actualDuration 
    : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm flex-shrink-0 ${
            isPlaying 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
              : 'bg-white text-orange-600 border-2 border-orange-500 hover:bg-orange-50'
          }`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div 
            className="h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(displayDuration)}</span>
          </div>
        </div>

        {/* Speed Control */}
        <button
          onClick={cyclePlaybackSpeed}
          className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-xs font-medium transition-colors"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
};