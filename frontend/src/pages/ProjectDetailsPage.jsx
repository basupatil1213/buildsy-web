import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
    ThumbsUp, 
    ThumbsDown, 
    MessageCircle, 
    ArrowLeft,
    Calendar,
    Users,
    Clock,
    ExternalLink,
    Send,
    Reply,
    MoreVertical,
    Flag,
    Share2
} from 'lucide-react';

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/community/projects/${projectId}`);
            
            if (response.data.success) {
                setProject(response.data.data.project);
                setComments(response.data.data.comments || []);
            }
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (voteType) => {
        if (!user) {
            alert('Please login to vote on projects');
            return;
        }

        try {
            const response = await api.post(`/community/projects/${projectId}/vote`, {
                voteType
            });

            if (response.data.success) {
                setProject(prev => ({
                    ...prev,
                    upvotes: response.data.data.upvotes,
                    downvotes: response.data.data.downvotes,
                    userVote: response.data.data.userVote
                }));
            }
        } catch (err) {
            console.error('Error voting:', err);
            alert('Failed to record vote');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await api.post(`/community/projects/${projectId}/comments`, {
                content: newComment.trim()
            });

            if (response.data.success) {
                setComments(prev => [response.data.data, ...prev]);
                setNewComment('');
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            alert('Failed to submit comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!user) {
            alert('Please login to reply');
            return;
        }

        if (!replyText.trim()) return;

        try {
            const response = await api.post(`/community/projects/${projectId}/comments`, {
                content: replyText.trim(),
                parentId
            });

            if (response.data.success) {
                // Refresh comments to get the updated nested structure
                const commentsResponse = await api.get(`/community/projects/${projectId}/comments`);
                if (commentsResponse.data.success) {
                    setComments(commentsResponse.data.data.comments);
                }
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            alert('Failed to submit reply');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const CommentItem = ({ comment, level = 0 }) => (
        <div className={`${level > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''} mb-4`}>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                            {comment.profiles?.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
                
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {comment.content}
                </p>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <Reply className="w-4 h-4" />
                        Reply
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <Flag className="w-4 h-4" />
                        Report
                    </button>
                </div>

                {replyingTo === comment.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Render nested replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading project details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            {error || 'Project not found'}
                        </h2>
                        <Link
                            to="/community"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Community
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Community
                </button>

                {/* Project Details */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {project.title}
                            </h1>
                            <p className="text-lg text-gray-700 mb-6">
                                {project.description}
                            </p>
                        </div>
                        <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Project Metadata */}
                    <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{project.profiles?.username || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(project.created_at)}</span>
                        </div>
                        {project.estimated_duration && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{project.estimated_duration}</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.category && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {project.category}
                            </span>
                        )}
                        {project.difficulty && (
                            <span className={`px-3 py-1 text-sm rounded-full ${
                                project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {project.difficulty}
                            </span>
                        )}
                        {project.technologies && project.technologies.length > 0 && 
                            project.technologies.map((tech, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    {tech}
                                </span>
                            ))
                        }
                    </div>

                    {/* Project Content */}
                    {project.features && project.features.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {project.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {project.implementation_notes && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Notes</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{project.implementation_notes}</p>
                        </div>
                    )}

                    {/* Voting */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => handleVote(1)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                project.userVote === 1
                                    ? 'bg-green-100 text-green-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            disabled={!user}
                        >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-medium">{project.upvotes || 0}</span>
                        </button>
                        
                        <button
                            onClick={() => handleVote(-1)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                project.userVote === -1
                                    ? 'bg-red-100 text-red-700'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            disabled={!user}
                        >
                            <ThumbsDown className="w-5 h-5" />
                            <span className="font-medium">{project.downvotes || 0}</span>
                        </button>

                        <div className="flex items-center gap-2 text-gray-600">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">{comments.length} Comments</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Comments</h2>

                    {/* Add Comment Form */}
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts about this project..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submittingComment}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600 mb-3">Please log in to comment on this project</p>
                            <Link
                                to="/auth"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Log In
                            </Link>
                        </div>
                    )}

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div>
                            {comments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
