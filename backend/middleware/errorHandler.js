// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('[ErrorHandler] Error caught:', err);

    // Default error
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        error.message = 'Validation Error';
        error.errors = messages;
        error.status = 400;
    }

    // Duplicate key error
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.status = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.status = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.status = 401;
    }

    res.status(error.status).json(error);
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};
