import openaillm from "../llm/openaillm.js";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { promptTemplates } from "../utils/promptTemplates.js";

// Create a system prompt template with variables
const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(`
You are {aiName}, an expert project idea generator and mentor. Your role is to help users brainstorm, refine, and develop comprehensive project ideas based on their interests, skills, and goals.

Guidelines for conversation:
1. Ask clarifying questions to understand the user's:
   - Technical skill level (beginner, intermediate, advanced)
   - Preferred technologies/languages
   - Project scope and timeline
   - Learning objectives
   - Industry interests

2. When suggesting project ideas, structure your response clearly:
   - Start with a brief engaging introduction
   - Project Name: "Clear, descriptive project name"
   - Description: Concise explanation of what the project does (2-3 sentences max)
   - Technologies: List the tech stack (e.g., React, Node.js, MongoDB)
   - Features: List 3-5 key features with bullet points
   - Difficulty: beginner/intermediate/advanced
   - Duration: Estimated time to complete (e.g., "2-3 weeks", "1 month")
   - Category: Web Development/Mobile Development/Game Development/AI/ML/Data Science

3. Keep project descriptions focused on WHAT the project does, not conversational text
4. Avoid phrases like "I suggest", "You could", "Here's an idea" in the structured parts
5. Make features specific and actionable

5. When the user seems satisfied with a project idea, encourage them to save it by saying something like: "This sounds like a great project! Would you like me to help you save this project idea so you can start working on it?"

Keep responses conversational and encouraging, but structure project information clearly for easy extraction.
Current context: {context}
`);

// Create a human message template
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate("{userMessage}");

// Create the main chat prompt template
const chatPromptTemplate = ChatPromptTemplate.fromMessages([
    systemPromptTemplate,
    humanPromptTemplate
]);

// Helper function to get the appropriate template based on context
const getTemplateForContext = (context, additionalParams = {}) => {
    switch (context.toLowerCase()) {
        case 'refinement':
        case 'project refinement':
            return {
                template: promptTemplates.refinement,
                params: {
                    aiName: "Buildsy AI",
                    projectContext: additionalParams.projectContext || "Not specified",
                    skillLevel: additionalParams.skillLevel || "Not specified",
                    timeframe: additionalParams.timeframe || "Not specified"
                }
            };
        
        case 'technology':
        case 'tech recommendation':
            return {
                template: promptTemplates.technology,
                params: {
                    aiName: "Buildsy AI",
                    projectType: additionalParams.projectType || "Not specified",
                    experienceLevel: additionalParams.experienceLevel || "Not specified",
                    requirements: additionalParams.requirements || "Not specified",
                    learningStyle: additionalParams.learningStyle || "Not specified"
                }
            };
        
        case 'features':
        case 'feature brainstorming':
            return {
                template: promptTemplates.features,
                params: {
                    aiName: "Buildsy AI",
                    projectConcept: additionalParams.projectConcept || "Not specified",
                    targetAudience: additionalParams.targetAudience || "Not specified",
                    coreFunctionality: additionalParams.coreFunctionality || "Not specified",
                    projectScope: additionalParams.projectScope || "Not specified"
                }
            };
        
        case 'timeline':
        case 'project timeline':
            return {
                template: promptTemplates.timeline,
                params: {
                    aiName: "Buildsy AI",
                    projectDetails: additionalParams.projectDetails || "Not specified",
                    developerExperience: additionalParams.developerExperience || "Not specified",
                    timePerWeek: additionalParams.timePerWeek || "Not specified",
                    complexity: additionalParams.complexity || "Not specified"
                }
            };
        
        case 'problem solving':
        case 'debugging':
            return {
                template: promptTemplates.problemSolving,
                params: {
                    aiName: "Buildsy AI",
                    currentIssue: additionalParams.currentIssue || "Not specified",
                    techStack: additionalParams.techStack || "Not specified",
                    errorDetails: additionalParams.errorDetails || "Not specified",
                    attemptedSolutions: additionalParams.attemptedSolutions || "Not specified"
                }
            };
        
        default:
            return {
                template: chatPromptTemplate,
                params: {
                    aiName: "Buildsy AI",
                    context: context
                }
            };
    }
};

export const chatService = async (messages, sessionId = null, context = "general project brainstorming", additionalParams = {}) => {
    console.log('[chatService] Start - Processing chat messages with context:', context);
    
    try {
        // Get the appropriate template and parameters for the context
        const { template, params } = getTemplateForContext(context, additionalParams);
        
        // Handle single message vs conversation
        if (messages.length === 1 && messages[0].role === 'user') {
            // Single message - use prompt template
            const formattedPrompt = await template.formatMessages({
                ...params,
                userMessage: messages[0].content
            });

            const response = await openaillm.invoke(formattedPrompt);
            console.log('[chatService] AI response generated successfully using PromptTemplate for context:', context);
            
            return {
                content: response.content,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                context: context
            };
        } else {
            // Multi-message conversation - use manual formatting with context
            let systemMessage;
            
            if (template === chatPromptTemplate) {
                // Use the general template
                systemMessage = await systemPromptTemplate.format(params);
            } else {
                // For specialized templates, extract the system message
                const tempMessages = await template.formatMessages({
                    ...params,
                    userMessage: "temp"
                });
                systemMessage = tempMessages[0].content;
            }
            
            const formattedMessages = [
                new SystemMessage(systemMessage),
                ...messages.slice(0, -1).map(msg => {
                    if (msg.role === 'user') {
                        return new HumanMessage(msg.content);
                    } else if (msg.role === 'assistant') {
                        return new AIMessage(msg.content);
                    }
                    return new HumanMessage(msg.content); // fallback
                }),
                // Add the last user message
                new HumanMessage(messages[messages.length - 1].content)
            ];

            const response = await openaillm.invoke(formattedMessages);
            console.log('[chatService] AI response generated successfully using conversation history with context:', context);
            
            return {
                content: response.content,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                context: context
            };
        }
    } catch (error) {
        console.error('[chatService] Error:', error);
        throw new Error('Failed to generate AI response');
    }
};