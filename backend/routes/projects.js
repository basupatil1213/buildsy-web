import { Router } from "express";
import { projectController } from "../controllers/projectController.js";
import { authenticateToken, optionalAuth } from "../utils/auth.js";

const projectRouter = Router();

// Create a new project (requires authentication)
projectRouter.post('/', authenticateToken, projectController.createProject);

// Get all projects for current user (requires authentication)
projectRouter.get('/', authenticateToken, projectController.getUserProjects);

// Search projects (optional authentication for user-specific results)
projectRouter.get('/search', optionalAuth, projectController.searchProjects);

// Get a specific project by ID (optional authentication for user-specific data)
projectRouter.get('/:id', optionalAuth, projectController.getProjectById);

// Update a project (requires authentication)
projectRouter.put('/:id', authenticateToken, projectController.updateProject);

// Delete a project (requires authentication)
projectRouter.delete('/:id', authenticateToken, projectController.deleteProject);

export default projectRouter;
