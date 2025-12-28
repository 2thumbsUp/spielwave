import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, User, Flame, Trash2 } from 'lucide-react';
import { VoicePlayer } from '../voice/VoicePlayer';
import { AgreementMeter } from './AgreementMeter';
import { formatTimeAgo } from '../../utils/formatters';
import { CATEGORIES } from '../../data/categories';

export const ThreadCard = ({ thread, onAgree, onDisagree, userVote, currentUserId, onDelete, onClick }) => {
  const category = CATEGORIES.find(c => c.id === thread.category);

  return (
    <div 
      className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm cursor-pointer"
      onClick={(e) => {
        // Don't navigate if clicking on interactive elements
        if (!e.target.closest('button') && !e.target.closest('audio')) {
          onClick?.();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white">
          <User size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">{thread.author.name}</div>
          <div className="text-xs text-gray-500">{formatTimeAgo(thread.createdAt)}</div>
        </div>
        <div className="flex items-center gap-2">
          {thread.isTrending && (
            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center gap-1">
              <Flame size={12} />
              Trending
            </div>
          )}
          <div
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
          >
            {category?.icon} {category?.name}
          </div>
  
          {/* Delete button - only show for thread author */}
          {currentUserId && currentUserId === thread.author.id && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete this thread? This cannot be undone.')) {
                  onDelete(thread.id);
                }
              }}
              className="p-1.5 hover:bg-red-100 rounded-full transition-colors group"
              title="Delete thread"
            >
              <Trash2 size={16} className="text-gray-400 group-hover:text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        {thread.title}
      </h3>

      {/* Content */}
      {thread.contentType === 'voice' && thread.content?.audioUrl && (
        <div className="mb-3">
          <VoicePlayer 
            audioUrl={thread.content.audioUrl} 
            duration={thread.content.duration} 
          />
        </div>
      )}

      {/* Tags */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {thread.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 font-medium transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Agreement Meter */}
      <div className="mb-4">
        <AgreementMeter 
          agrees={thread.stats.agrees} 
          disagrees={thread.stats.disagrees} 
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAgree(thread.id);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            userVote === 'agree'
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ThumbsUp size={16} />
          <span>Agree</span>
          <span className="text-xs opacity-75">({thread.stats.agrees})</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisagree(thread.id);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            userVote === 'disagree'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ThumbsDown size={16} />
          <span>Disagree</span>
          <span className="text-xs opacity-75">({thread.stats.disagrees})</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors text-gray-700 ml-auto"
        >
          <MessageCircle size={16} />
          <span>{thread.stats.replies}</span>
        </button>

        {/*
        <div className="text-sm text-gray-500">
          {thread.stats.views} views
        </div>
        */}
      </div>
    </div>
  );
};