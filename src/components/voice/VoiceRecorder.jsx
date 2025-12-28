import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, X, Check } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { formatDuration } from '../../utils/formatters';

export const VoiceRecorder = ({ onComplete, onCancel, maxDuration = 90 }) => {
  const {
    isRecording,
    isPaused,
    duration,
    audioURL,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    reset,
  } = useVoiceRecorder(maxDuration);

  const [audioLevels, setAudioLevels] = useState(Array(20).fill(0));
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Visualize audio levels
  useEffect(() => {
    if (isRecording && !isPaused) {
      const setupAudioVisualization = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          
          analyser.fftSize = 64;
          microphone.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateLevels = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              
              // Sample 20 values from the frequency data
              const levels = [];
              const step = Math.floor(bufferLength / 20);
              for (let i = 0; i < 20; i++) {
                const value = dataArray[i * step] || 0;
                levels.push(Math.min(100, (value / 255) * 100));
              }
              
              setAudioLevels(levels);
            }
            animationRef.current = requestAnimationFrame(updateLevels);
          };

          updateLevels();
        } catch (err) {
          console.error('Error setting up audio visualization:', err);
        }
      };

      setupAudioVisualization();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const handleComplete = () => {
    if (audioBlob) {
      onComplete({
        audioBlob,
        audioURL,
        duration,
      });
      //reset();
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Timer */}
        <div className={`text-4xl font-bold transition-colors ${
          duration >= maxDuration * 0.9 ? 'text-red-500' : 'text-gray-900'
        }`}>
          {formatDuration(duration)}
        </div>

        {/* Waveform Visualization */}
        {isRecording && !isPaused ? (
          <div className="space-y-2 w-full max-w-md">
            <div className="flex gap-1 items-end h-20">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(10, level)}%`,
                    opacity: 0.7 + (level / 100) * 0.3,
                  }}
                />
              ))}
            </div>
    
            {audioLevels.every(l => l === 0) && (
              <div className="text-sm text-orange-600 font-medium text-center">
                ⚠️ No audio detected - check your microphone
              </div>
            )}
          </div>
        ) : audioURL ? (
          <div className="w-full max-w-md">
            <audio src={audioURL} controls className="w-full" />
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-gray-400">
            <Mic size={48} />
          </div>
        )}

        {/* Max duration warning */}
        {duration >= maxDuration * 0.8 && isRecording && (
          <div className="text-sm text-orange-600 font-medium">
            {maxDuration - duration} seconds remaining
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isRecording && !audioURL && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <Mic size={20} />
              Start Recording
            </button>
          )}

          {isRecording && !audioURL && (
            <>
              {!isPaused ? (
                <>
                  <button
                    onClick={pauseRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    <Pause size={20} />
                    Pause
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                  >
                    <Square size={20} />
                    Stop
                  </button>
                </>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                >
                  <Play size={20} />
                  Resume
                </button>
              )}
              
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
            </>
          )}

          {audioURL && !isRecording && (
            <>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-sm"
              >
                <Check size={20} />
                Use This Recording
              </button>
              <button
                onClick={() => {
                  reset();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                <X size={20} />
                Re-record
              </button>
            </>
          )}
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-500">
          {!isRecording && !audioURL && `Max duration: ${maxDuration} seconds`}
          {isRecording && 'Recording in progress...'}
          {audioURL && 'Preview your recording above'}
        </p>
      </div>
    </div>
  );
};