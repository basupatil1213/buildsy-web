import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, User, Trash2, Edit, Share, Globe, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const IdeaCard = ({ 
  idea, 
  onVote, 
  onDelete, 
  onEdit, 
  onTogglePublic,
  showActions = false,
  onClick 
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (!user || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(idea.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      onDelete(idea.id);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {idea.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {idea.description}
          </p>
        </div>
        
        {showActions && user && idea.user_id === user.id && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePublic && onTogglePublic(idea.id, !idea.is_public);
              }}
              className={`p-2 transition-colors ${
                idea.is_public 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 hover:text-green-600'
              }`}
              title={idea.is_public ? 'Make private' : 'Make public'}
            >
              {idea.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(idea);
              }}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Edit idea"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete idea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {idea.difficulty && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}>
            {idea.difficulty}
          </span>
        )}
        
        {idea.category && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {idea.category}
          </span>
        )}

        {idea.is_public && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </span>
        )}
        
        {idea.estimated_duration && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{idea.estimated_duration}</span>
          </span>
        )}
      </div>

      {/* Tech Stack */}
      {idea.tech_stack && idea.tech_stack.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {idea.tech_stack.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {tech}
              </span>
            ))}
            {idea.tech_stack.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                +{idea.tech_stack.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {/* Vote buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote(1);
              }}
              disabled={!user || isVoting}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                idea.user_vote === 1
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-4 h-4 ${idea.user_vote === 1 ? 'fill-current' : ''}`} />
              <span>{idea.total_votes || 0}</span>
            </button>
          </div>

          {/* Comments */}
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{idea.comment_count || 0}</span>
          </div>
        </div>

        {/* Author and date */}
        <div className="flex items-center space-x-3">
          {idea.author_email && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="truncate max-w-24">{idea.author_email}</span>
            </div>
          )}
          
          {idea.created_at && (
            <span>{formatDate(idea.created_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
