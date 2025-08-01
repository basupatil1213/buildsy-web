import { chatService } from "../services/charService.js";
import { chatMessageSchema } from "../validators/schemas.js";
import { v4 as uuidv4 } from 'uuid';

export const chatController = {
    // Handle chat messages for project idea generation
    async sendMessage(req, res) {
        console.log('[chatController] sendMessage - Start');
        
        try {
            const { error, value } = chatMessageSchema.validate(req.body);
            
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details.map(detail => detail.message)
                });
            }

            const { message, sessionId, userId, context, additionalParams } = value;
            
            // Generate session ID if not provided
            const currentSessionId = sessionId || uuidv4();
            
            // For now, we'll handle simple message format
            // In a real app, you might want to store chat history in database
            const messages = [
                {
                    role: 'user',
                    content: message
                }
            ];

            // Pass context and additional parameters to the chat service
            const chatContext = context || "general project brainstorming";
            const response = await chatService(messages, currentSessionId, chatContext, additionalParams || {});
            
            console.log('[chatController] sendMessage - Success');
            return res.json({
                success: true,
                message: 'Chat response generated successfully',
                data: {
                    response: response.content,
                    sessionId: currentSessionId,
                    timestamp: response.timestamp
                }
            });
        } catch (error) {
            console.error('[chatController] sendMessage - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process chat message',
                error: error.message
            });
        }
    },

    // Handle conversation with message history
    async sendConversation(req, res) {
        console.log('[chatController] sendConversation - Start');
        
        try {
            const { messages, sessionId, userId, context, additionalParams } = req.body;
            
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Messages array is required and cannot be empty'
                });
            }

            // Validate message format
            for (const msg of messages) {
                if (!msg.role || !msg.content) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each message must have role and content properties'
                    });
                }
            }

            const currentSessionId = sessionId || uuidv4();
            const chatContext = context || "general project brainstorming";
            const response = await chatService(messages, currentSessionId, chatContext, additionalParams || {});
            
            console.log('[chatController] sendConversation - Success');
            return res.json({
                success: true,
                message: 'Conversation processed successfully',
                data: {
                    response: response.content,
                    sessionId: currentSessionId,
                    timestamp: response.timestamp
                }
            });
        } catch (error) {
            console.error('[chatController] sendConversation - Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process conversation',
                error: error.message
            });
        }
    }
};

// Backward compatibility - keep the old function name as an alias
export const postChatController = chatController.sendConversation;

 