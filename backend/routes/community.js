import express from 'express';
import { communityController } from '../controllers/communityController.js';
import { authenticateToken, optionalAuth } from '../utils/auth.js';

const router = express.Router();

console.log('[Community Routes] Loading community routes...');

// Get public projects for community page (with optional user vote info)
router.get('/projects', optionalAuth, communityController.getPublicProjects);
console.log('[Community Routes] Added GET /projects route');

// Get project details with comments
router.get('/projects/:projectId', communityController.getProjectDetails);

// Vote on a project (requires authentication)
router.post('/projects/:projectId/vote', authenticateToken, communityController.voteProject);

// Add comment to project (requires authentication)
router.post('/projects/:projectId/comments', authenticateToken, communityController.addComment);

// Get comments for a project
router.get('/projects/:projectId/comments', communityController.getProjectComments);

console.log('[Community Routes] Community routes loaded successfully');

export default router;
