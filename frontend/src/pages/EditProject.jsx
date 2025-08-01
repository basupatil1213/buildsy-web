import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI } from '../services/api';
import { 
    Save, 
    ArrowLeft, 
    Loader2, 
    Plus, 
    X, 
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';

const EditProject = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        difficulty: '',
        estimated_duration: '',
        tech_stack: [],
        features: [],
        requirements: [],
        is_public: false,
        status: 'idea'
    });

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
    const statuses = ['idea', 'in_progress', 'completed', 'on_hold'];

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(projectId);
            
            if (response.success) {
                const projectData = response.data;
                
                // Check if user owns this project
                if (projectData.user_id !== user?.id) {
                    setError('You do not have permission to edit this project');
                    return;
                }
                
                setProject(projectData);
                setFormData({
                    name: projectData.name || '',
                    description: projectData.description || '',
                    category: projectData.category || '',
                    difficulty: projectData.difficulty || '',
                    estimated_duration: projectData.estimated_duration || '',
                    tech_stack: projectData.tech_stack || [],
                    features: projectData.features || [],
                    requirements: projectData.requirements || [],
                    is_public: projectData.is_public || false,
                    status: projectData.status || 'idea'
                });
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setError('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayAdd = (field, value) => {
        if (value.trim() && !formData[field].includes(value.trim())) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        }
    };

    const handleArrayRemove = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            setSaving(true);
            setError('');
            
            const response = await projectsAPI.update(projectId, formData);
            
            if (response.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error updating project:', err);
            setError('Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
                
                <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                <p className="text-gray-600">Update your project details</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select difficulty</option>
                                {difficulties.map(diff => (
                                    <option key={diff} value={diff}>
                                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Duration
                            </label>
                            <input
                                type="text"
                                value={formData.estimated_duration}
                                onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., 2-3 weeks"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={formData.is_public}
                                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="is_public" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                {formData.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                Make project public
                            </label>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Describe your project..."
                        />
                    </div>
                </div>

                <ArrayInputSection
                    title="Tech Stack"
                    items={formData.tech_stack}
                    onAdd={(value) => handleArrayAdd('tech_stack', value)}
                    onRemove={(index) => handleArrayRemove('tech_stack', index)}
                    placeholder="Add a technology (e.g., React, Node.js)"
                />

                <ArrayInputSection
                    title="Features"
                    items={formData.features}
                    onAdd={(value) => handleArrayAdd('features', value)}
                    onRemove={(index) => handleArrayRemove('features', index)}
                    placeholder="Add a feature"
                />

                <ArrayInputSection
                    title="Requirements"
                    items={formData.requirements}
                    onAdd={(value) => handleArrayAdd('requirements', value)}
                    onRemove={(index) => handleArrayRemove('requirements', index)}
                    placeholder="Add a requirement"
                />

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ArrayInputSection = ({ title, items, onAdd, onRemove, placeholder }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            onAdd(newItem);
            setNewItem('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={placeholder}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd(e)}
                />
                <button
                    onClick={handleAdd}
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                        {item}
                        <button
                            onClick={() => onRemove(index)}
                            type="button"
                            className="text-gray-500 hover:text-red-500"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default EditProject;
