import { Router } from "express";
import { chatController, postChatController } from "../controllers/chatController.js";

const chatRouter = Router();

// Get available chat contexts and their parameters
chatRouter.get('/contexts', (req, res) => {
    res.json({
        success: true,
        message: 'Available chat contexts',
        data: {
            contexts: [
                {
                    name: 'general',
                    description: 'General project brainstorming and idea generation',
                    parameters: []
                },
                {
                    name: 'refinement',
                    description: 'Refine and improve existing project ideas',
                    parameters: ['projectContext', 'skillLevel', 'timeframe']
                },
                {
                    name: 'technology',
                    description: 'Get technology and tech stack recommendations',
                    parameters: ['projectType', 'experienceLevel', 'requirements', 'learningStyle']
                },
                {
                    name: 'features',
                    description: 'Brainstorm features for your project',
                    parameters: ['projectConcept', 'targetAudience', 'coreFunctionality', 'projectScope']
                },
                {
                    name: 'timeline',
                    description: 'Create realistic project timelines',
                    parameters: ['projectDetails', 'developerExperience', 'timePerWeek', 'complexity']
                },
                {
                    name: 'problem solving',
                    description: 'Get help with technical problems and debugging',
                    parameters: ['currentIssue', 'techStack', 'errorDetails', 'attemptedSolutions']
                }
            ]
        }
    });
});

// Send a single message (simple format)
chatRouter.post('/message', chatController.sendMessage);

// Send conversation with message history
chatRouter.post('/conversation', chatController.sendConversation);

// Backward compatibility - keep the old route
chatRouter.post('/', postChatController);

export default chatRouter;


