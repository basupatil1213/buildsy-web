import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const projectService = {
    // Create a new project
    async createProject(projectData) {
        try {
            const projectId = uuidv4();
            const projectWithId = {
                id: projectId,
                ...projectData,
                status: 'idea',
                is_public: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('projects')
                .insert([projectWithId])
                .select()
                .single();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('[projectService] createProject error:', error);
            throw error;
        }
    },

    // Get all projects for a user
    async getUserProjects(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            const { data, error, count } = await supabase
                .from('project_details')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                projects: data,
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('[projectService] getUserProjects error:', error);
            throw error;
        }
    },

    // Get public projects for community page
    async getPublicProjects(page = 1, limit = 10, filters = {}, userId = null) {
        try {
            const offset = (page - 1) * limit;
            
            let query = supabase
                .from('project_details')
                .select('*', { count: 'exact' })
                .eq('is_public', true);

            // Apply filters
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            
            if (filters.difficulty) {
                query = query.eq('difficulty', filters.difficulty);
            }
            
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            // Apply sorting
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
            
            const { data, error, count } = await query
                .order(sortBy, sortOrder)
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            let projects = data || [];

            // Add vote information for all projects
            if (projects.length > 0) {
                const projectIds = projects.map(p => p.id);
                
                // Get all votes for all projects
                const { data: allVotes } = await supabase
                    .from('votes')
                    .select('project_id, vote_type')
                    .in('project_id', projectIds);

                // Get user votes if userId is provided
                let userVotes = [];
                if (userId) {
                    const { data } = await supabase
                        .from('votes')
                        .select('project_id, vote_type')
                        .eq('user_id', userId)
                        .in('project_id', projectIds);
                    userVotes = data || [];
                }

                // Add vote counts and userVote property to each project
                projects = projects.map(project => {
                    const projectVotes = allVotes?.filter(v => v.project_id === project.id) || [];
                    const upvotes = projectVotes.filter(v => v.vote_type === 1).length;
                    const downvotes = projectVotes.filter(v => v.vote_type === -1).length;
                    
                    const userVote = userVotes.find(v => v.project_id === project.id);
                    
                    return {
                        ...project,
                        upvotes,
                        downvotes,
                        userVote: userVote ? userVote.vote_type : null
                    };
                });
            }

            return {
                projects,
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('[projectService] getPublicProjects error:', error);
            throw error;
        }
    },

    // Get a single project by ID with vote information
    async getProjectById(projectId, userId = null) {
        try {
            const { data, error } = await supabase
                .from('project_details')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Project not found
                }
                throw new Error(`Database error: ${error.message}`);
            }

            // Get user's vote if userId provided
            if (userId) {
                const { data: voteData } = await supabase
                    .from('votes')
                    .select('vote_type')
                    .eq('project_id', projectId)
                    .eq('user_id', userId)
                    .single();
                
                data.user_vote = voteData?.vote_type || null;
            }

            return data;
        } catch (error) {
            console.error('[projectService] getProjectById error:', error);
            throw error;
        }
    },

    // Update a project
    async updateProject(projectId, updateData, userId = null) {
        try {
            const updates = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            let query = supabase
                .from('projects')
                .update(updates)
                .eq('id', projectId);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query.select().single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Project not found
                }
                throw new Error(`Database error: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('[projectService] updateProject error:', error);
            throw error;
        }
    },

    // Delete a project
    async deleteProject(projectId, userId = null) {
        try {
            let query = supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { error } = await query;

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return true;
        } catch (error) {
            console.error('[projectService] deleteProject error:', error);
            throw error;
        }
    },

    // Vote on a project
    async voteProject(projectId, userId, voteType) {
        try {
            // Check if user already voted
            const { data: existingVote } = await supabase
                .from('votes')
                .select('*')
                .eq('project_id', projectId)
                .eq('user_id', userId)
                .single();

            let action;
            let currentUserVote = null;

            if (existingVote) {
                if (existingVote.vote_type === voteType) {
                    // Remove vote if same type
                    const { error } = await supabase
                        .from('votes')
                        .delete()
                        .eq('id', existingVote.id);
                    
                    if (error) throw error;
                    action = 'removed';
                    currentUserVote = null;
                } else {
                    // Update vote type
                    const { error } = await supabase
                        .from('votes')
                        .update({ vote_type: voteType })
                        .eq('id', existingVote.id);
                    
                    if (error) throw error;
                    action = 'updated';
                    currentUserVote = voteType;
                }
            } else {
                // Create new vote
                const { error } = await supabase
                    .from('votes')
                    .insert([{
                        project_id: projectId,
                        user_id: userId,
                        vote_type: voteType
                    }]);
                
                if (error) throw error;
                action = 'created';
                currentUserVote = voteType;
            }

            // Get updated vote counts
            const { data: voteCounts } = await supabase
                .from('votes')
                .select('vote_type')
                .eq('project_id', projectId);

            const upvotes = voteCounts?.filter(v => v.vote_type === 1).length || 0;
            const downvotes = voteCounts?.filter(v => v.vote_type === -1).length || 0;

            return {
                action,
                voteType,
                upvotes,
                downvotes,
                userVote: currentUserVote
            };
        } catch (error) {
            console.error('[projectService] voteProject error:', error);
            throw error;
        }
    },

    // Add comment to project
    async addComment(projectId, userId, content, parentId = null) {
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    project_id: projectId,
                    user_id: userId,
                    content,
                    parent_id: parentId
                }])
                .select('*')
                .single();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            // Add placeholder author info for consistency
            return {
                ...data,
                author_email: 'user@buildsy.com' // Placeholder for now
            };
        } catch (error) {
            console.error('[projectService] addComment error:', error);
            throw error;
        }
    },

    // Get comments for a project
    async getProjectComments(projectId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const { data, error, count } = await supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('project_id', projectId)
                .is('parent_id', null) // Only get top-level comments
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            // Get replies for each comment
            const commentsWithReplies = await Promise.all(
                data.map(async (comment) => {
                    const { data: replies } = await supabase
                        .from('comments')
                        .select('*')
                        .eq('parent_id', comment.id)
                        .order('created_at', { ascending: true });
                    
                    return {
                        ...comment,
                        replies: replies || [],
                        author_email: 'anonymous@buildsy.com' // Placeholder for now
                    };
                })
            );

            return {
                comments: commentsWithReplies,
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('[projectService] getProjectComments error:', error);
            throw error;
        }
    },

    // Search projects by category or tech stack
    async searchProjects(searchParams, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            let query = supabase.from('project_details').select('*', { count: 'exact' });

            if (searchParams.category) {
                query = query.eq('category', searchParams.category);
            }

            if (searchParams.difficulty) {
                query = query.eq('difficulty', searchParams.difficulty);
            }

            if (searchParams.techStack && searchParams.techStack.length > 0) {
                query = query.contains('tech_stack', searchParams.techStack);
            }

            if (searchParams.search) {
                query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`);
            }

            if (searchParams.isPublic !== undefined) {
                query = query.eq('is_public', searchParams.isPublic);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                projects: data,
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('[projectService] searchProjects error:', error);
            throw error;
        }
    }
};
