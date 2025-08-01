import { projectService } from '../services/projectService.js';

export const communityController = {
    // Get public projects for community page
    async getPublicProjects(req, res) {
        console.log('[communityController] getPublicProjects - Start');
        
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            
            const filters = {
                category: req.query.category,
                difficulty: req.query.difficulty,
                search: req.query.search,
                sortBy: req.query.sortBy || 'created_at',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await projectService.getPublicProjects(page, limit, filters);
            
            console.log('[communityController] getPublicProjects - Success');
            return res.json({
                success: true,
                message: 'Public projects retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('[communityController] getPublicProjects - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve public projects',
                error: error.message
            });
        }
    },

    // Vote on a project
    async voteProject(req, res) {
        console.log('[communityController] voteProject - Start');
        
        try {
            const { projectId } = req.params;
            const { voteType } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (![-1, 1].includes(voteType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Vote type must be -1 (downvote) or 1 (upvote)'
                });
            }

            const result = await projectService.voteProject(projectId, userId, voteType);
            
            console.log('[communityController] voteProject - Success');
            return res.json({
                success: true,
                message: 'Vote recorded successfully',
                data: result
            });
        } catch (error) {
            console.error('[communityController] voteProject - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to record vote',
                error: error.message
            });
        }
    },

    // Get project details with comments
    async getProjectDetails(req, res) {
        console.log('[communityController] getProjectDetails - Start');
        
        try {
            const { projectId } = req.params;
            const userId = req.user?.id;

            const project = await projectService.getProjectById(projectId, userId);
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Get comments for the project
            const comments = await projectService.getProjectComments(projectId);
            
            console.log('[communityController] getProjectDetails - Success');
            return res.json({
                success: true,
                message: 'Project details retrieved successfully',
                data: {
                    project,
                    comments: comments.comments
                }
            });
        } catch (error) {
            console.error('[communityController] getProjectDetails - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve project details',
                error: error.message
            });
        }
    },

    // Add comment to project
    async addComment(req, res) {
        console.log('[communityController] addComment - Start');
        
        try {
            const { projectId } = req.params;
            const { content, parentId } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!content || content.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment content is required'
                });
            }

            if (content.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment must be less than 1000 characters'
                });
            }

            const comment = await projectService.addComment(projectId, userId, content.trim(), parentId);
            
            console.log('[communityController] addComment - Success');
            return res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                data: comment
            });
        } catch (error) {
            console.error('[communityController] addComment - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to add comment',
                error: error.message
            });
        }
    },

    // Get comments for a project
    async getProjectComments(req, res) {
        console.log('[communityController] getProjectComments - Start');
        
        try {
            const { projectId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await projectService.getProjectComments(projectId, page, limit);
            
            console.log('[communityController] getProjectComments - Success');
            return res.json({
                success: true,
                message: 'Comments retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('[communityController] getProjectComments - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve comments',
                error: error.message
            });
        }
    }
};
