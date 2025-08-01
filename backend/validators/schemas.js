import Joi from 'joi';

export const chatMessageSchema = Joi.object({
    message: Joi.string().required().min(1).max(1000),
    sessionId: Joi.string().optional(),
    userId: Joi.string().optional(),
    context: Joi.string().optional().max(200),
    additionalParams: Joi.object().optional()
});

export const createProjectSchema = Joi.object({
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().required().min(10).max(1000),
    techStack: Joi.array().items(Joi.string()).default([]),
    category: Joi.string().required(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    estimatedDuration: Joi.string().required(),
    features: Joi.array().items(Joi.string()).default([]),
    requirements: Joi.array().items(Joi.string()).default([]),
    userId: Joi.string().optional()
});

export const updateProjectSchema = Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().min(10).max(1000),
    techStack: Joi.array().items(Joi.string()),
    category: Joi.string(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    estimatedDuration: Joi.string(),
    features: Joi.array().items(Joi.string()),
    requirements: Joi.array().items(Joi.string()),
    status: Joi.string().valid('idea', 'planning', 'in_progress', 'completed', 'on_hold')
});
