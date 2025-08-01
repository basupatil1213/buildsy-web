import { projectService } from '../services/projectService.js';
import { createProjectSchema, updateProjectSchema } from '../validators/schemas.js';

export const projectController = {
    // Create a new project
    async createProject(req, res) {
        console.log('[projectController] createProject - Start');
        
        try {
            const { error, value } = createProjectSchema.validate(req.body);
            
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details.map(detail => detail.message)
                });
            }

            // Add user ID if available (from auth middleware)
            const projectData = {
                ...value,
                user_id: req.user?.id || null
            };

            const project = await projectService.createProject(projectData);
            
            console.log('[projectController] createProject - Success');
            return res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: project
            });
        } catch (error) {
            console.error('[projectController] createProject - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create project',
                error: error.message
            });
        }
    },

    // Get all projects for the current user
    async getUserProjects(req, res) {
        console.log('[projectController] getUserProjects - Start');
        
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const userId = req.user?.id || req.query.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const result = await projectService.getUserProjects(userId, page, limit);
            
            console.log('[projectController] getUserProjects - Success');
            return res.json({
                success: true,
                message: 'Projects retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('[projectController] getUserProjects - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve projects',
                error: error.message
            });
        }
    },

    // Get a single project by ID
    async getProjectById(req, res) {
        console.log('[projectController] getProjectById - Start');
        
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const project = await projectService.getProjectById(id, userId);
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            console.log('[projectController] getProjectById - Success');
            return res.json({
                success: true,
                message: 'Project retrieved successfully',
                data: project
            });
        } catch (error) {
            console.error('[projectController] getProjectById - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve project',
                error: error.message
            });
        }
    },

    // Update a project
    async updateProject(req, res) {
        console.log('[projectController] updateProject - Start');
        
        try {
            const { id } = req.params;
            const { error, value } = updateProjectSchema.validate(req.body);
            
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const userId = req.user?.id;
            const project = await projectService.updateProject(id, value, userId);
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found or you do not have permission to update it'
                });
            }

            console.log('[projectController] updateProject - Success');
            return res.json({
                success: true,
                message: 'Project updated successfully',
                data: project
            });
        } catch (error) {
            console.error('[projectController] updateProject - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update project',
                error: error.message
            });
        }
    },

    // Delete a project
    async deleteProject(req, res) {
        console.log('[projectController] deleteProject - Start');
        
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const deleted = await projectService.deleteProject(id, userId);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found or you do not have permission to delete it'
                });
            }

            console.log('[projectController] deleteProject - Success');
            return res.json({
                success: true,
                message: 'Project deleted successfully'
            });
        } catch (error) {
            console.error('[projectController] deleteProject - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete project',
                error: error.message
            });
        }
    },

    // Search projects
    async searchProjects(req, res) {
        console.log('[projectController] searchProjects - Start');
        
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const searchParams = {
                category: req.query.category,
                difficulty: req.query.difficulty,
                search: req.query.search,
                techStack: req.query.techStack ? req.query.techStack.split(',') : undefined
            };

            const result = await projectService.searchProjects(searchParams, page, limit);
            
            console.log('[projectController] searchProjects - Success');
            return res.json({
                success: true,
                message: 'Projects searched successfully',
                data: result
            });
        } catch (error) {
            console.error('[projectController] searchProjects - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to search projects',
                error: error.message
            });
        }
    }
};
