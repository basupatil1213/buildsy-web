import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
    ThumbsUp, 
    ThumbsDown, 
    MessageCircle, 
    Search, 
    Filter,
    Clock,
    TrendingUp,
    Users,
    Calendar,
    ExternalLink,
    ChevronDown,
    Star
} from 'lucide-react';

const CommunityPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        difficulty: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        'Web Development',
        'Mobile App',
        'Data Science',
        'Machine Learning',
        'Game Development',
        'DevOps',
        'UI/UX Design',
        'API Development',
        'Blockchain',
        'IoT',
        'Other'
    ];

    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const sortOptions = [
        { value: 'created_at', label: 'Newest First' },
        { value: 'votes', label: 'Most Popular' },
        { value: 'comments', label: 'Most Discussed' },
        { value: 'title', label: 'Alphabetical' }
    ];

    useEffect(() => {
        fetchProjects();
    }, [currentPage, filters]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: '12',
                ...Object.entries(filters).reduce((acc, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                }, {})
            });

            const response = await api.get(`/api/community/projects?${queryParams}`);
            console.log('[CommunityPage] API Response:', response.data);
            
            if (response.data?.success) {
                const responseData = response.data.data || {};
                console.log('[CommunityPage] Response Data:', responseData);
                setProjects(responseData.projects || []);
                setTotalPages(responseData.totalPages || 1);
            } else {
                console.error('API response error:', response.data);
                setError(response.data?.message || 'Failed to load community projects');
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            
            // More detailed error messages
            if (err.response?.status === 401) {
                setError('Authentication required. Please log in.');
            } else if (err.response?.status === 404) {
                setError('Community service not found. Please try again later.');
            } else if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network error. Please check your connection.');
            } else {
                setError('Failed to load community projects. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (projectId, voteType) => {
        if (!user) {
            // TODO: Show login modal or redirect to auth
            alert('Please login to vote on projects');
            return;
        }

        try {
            const response = await api.post(`/api/community/projects/${projectId}/vote`, {
                voteType
            });

            if (response.data.success) {
                // Update the project in the list with new vote counts
                setProjects(prev => prev.map(project => 
                    project.id === projectId 
                        ? { 
                            ...project, 
                            upvotes: response.data.data.upvotes,
                            downvotes: response.data.data.downvotes,
                            userVote: response.data.data.userVote
                          }
                        : project
                ));
            }
        } catch (err) {
            console.error('Error voting:', err);
            alert('Failed to record vote');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            difficulty: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        setCurrentPage(1);
    };

    const ProjectCard = ({ project }) => (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <Link 
                        to={`/community/projects/${project.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                        {project.name}
                    </Link>
                    <p className="text-gray-600 mt-2 line-clamp-3">
                        {project.description}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {project.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {project.category}
                    </span>
                )}
                {project.difficulty && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {project.difficulty ? project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1) : 'Unknown'}
                    </span>
                )}
                {project.estimated_duration && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.estimated_duration}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.profiles?.username || 'Anonymous'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handleVote(project.id, 1)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                            project.userVote === 1
                                ? 'bg-green-100 text-green-700'
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        disabled={!user}
                    >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{project.upvotes || 0}</span>
                    </button>
                    
                    <button
                        onClick={() => handleVote(project.id, -1)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                            project.userVote === -1
                                ? 'bg-red-100 text-red-700'
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        disabled={!user}
                    >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{project.downvotes || 0}</span>
                    </button>

                    <Link
                        to={`/community/projects/${project.id}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>{project.comment_count || 0}</span>
                    </Link>
                </div>

                <Link
                    to={`/community/projects/${project.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                    View Details
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );

    if (loading && projects.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading community projects...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Community Projects
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover amazing side project ideas shared by our community. 
                        Vote, comment, and get inspired!
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Difficulties</option>
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* Projects Grid */}
                {projects.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {projects.map(project => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                
                                <span className="text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No projects found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search criteria or be the first to share a project!
                        </p>
                        <Link
                            to="/generate"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Generate New Project
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
