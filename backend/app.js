import cors from "cors";
import express from "express";
import initializeRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const initialize = (app) => {
    // CORS configuration
    app.use(cors({
        origin: "*"
    }));
    
    // Body parsing middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Routes initialization
    initializeRoutes(app);

    // Error handling middleware (must be last)
    app.use(notFound);
    app.use(errorHandler);
    
    console.log('[App] Application initialized successfully');
};

export default initialize;