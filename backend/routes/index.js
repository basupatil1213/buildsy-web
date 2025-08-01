import { Router } from "express";
import chatRouter from "./chat.js";
import projectRouter from "./projects.js";
import communityRouter from "./community.js";

const initializeRoutes = (app) => {
    console.log('[Routes] Initializing routes');
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'OK', 
            message: 'Buildsy API is running',
            timestamp: new Date().toISOString()
        });
    });

    // API routes
    app.use('/api/chat', chatRouter);
    app.use('/api/projects', projectRouter);
    
    // Debug log for community routes
    console.log('[Routes] Adding community routes...');
    app.use('/api/community', communityRouter);
    console.log('[Routes] Community routes added successfully');
    
    // Backward compatibility
    app.use('/chat', chatRouter);
    
    console.log('[Routes] Routes initialized successfully');
};

export default initializeRoutes;