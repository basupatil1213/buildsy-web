# Using PromptTemplate Features in Buildsy Chat API

This document explains how to use the enhanced LangChain PromptTemplate features in the Buildsy chat system.

## Available Chat Contexts

### 1. General (default)
Basic project brainstorming and idea generation.

```javascript
// Simple request
POST /api/chat/message
{
  "message": "I want to build a web application",
  "context": "general"
}
```

### 2. Project Refinement
Help refine existing project ideas with specific parameters.

```javascript
POST /api/chat/message
{
  "message": "How can I improve my e-commerce project idea?",
  "context": "refinement",
  "additionalParams": {
    "projectContext": "Building an e-commerce platform for local businesses",
    "skillLevel": "intermediate",
    "timeframe": "3 months"
  }
}
```

### 3. Technology Recommendations
Get specific tech stack recommendations.

```javascript
POST /api/chat/message
{
  "message": "What technologies should I use for my social media app?",
  "context": "technology",
  "additionalParams": {
    "projectType": "Social Media Application",
    "experienceLevel": "beginner",
    "requirements": "Real-time chat, user profiles, photo sharing",
    "learningStyle": "hands-on with tutorials"
  }
}
```

### 4. Feature Brainstorming
Brainstorm features for your project.

```javascript
POST /api/chat/message
{
  "message": "What features should I include in my task management app?",
  "context": "features",
  "additionalParams": {
    "projectConcept": "Personal task management application",
    "targetAudience": "Students and professionals",
    "coreFunctionality": "Create, organize, and track tasks",
    "projectScope": "MVP for portfolio"
  }
}
```

### 5. Timeline Planning
Create realistic project timelines.

```javascript
POST /api/chat/message
{
  "message": "Help me create a development timeline for my project",
  "context": "timeline",
  "additionalParams": {
    "projectDetails": "React-based weather app with geolocation",
    "developerExperience": "6 months with React",
    "timePerWeek": "15 hours",
    "complexity": "intermediate"
  }
}
```

### 6. Problem Solving
Get help with technical issues and debugging.

```javascript
POST /api/chat/message
{
  "message": "My API calls are failing and I'm getting CORS errors",
  "context": "problem solving",
  "additionalParams": {
    "currentIssue": "CORS errors when calling external API",
    "techStack": "React frontend, Node.js backend",
    "errorDetails": "Access-Control-Allow-Origin header missing",
    "attemptedSolutions": "Added cors middleware, set headers manually"
  }
}
```

## Conversation API with Context

For multi-message conversations, use the conversation endpoint:

```javascript
POST /api/chat/conversation
{
  "messages": [
    {
      "role": "user",
      "content": "I want to build a mobile app"
    },
    {
      "role": "assistant", 
      "content": "What kind of mobile app are you thinking about?"
    },
    {
      "role": "user",
      "content": "Something for fitness tracking"
    }
  ],
  "context": "refinement",
  "additionalParams": {
    "skillLevel": "beginner",
    "timeframe": "2 months"
  }
}
```

## Response Format

All responses include:

```javascript
{
  "success": true,
  "message": "Chat response generated successfully",
  "data": {
    "response": "AI generated response...",
    "sessionId": "unique-session-id",
    "timestamp": "2025-01-31T...",
    "context": "refinement"
  }
}
```

## Get Available Contexts

Retrieve all available contexts and their parameters:

```javascript
GET /api/chat/contexts

// Response:
{
  "success": true,
  "message": "Available chat contexts",
  "data": {
    "contexts": [
      {
        "name": "general",
        "description": "General project brainstorming and idea generation",
        "parameters": []
      },
      {
        "name": "refinement", 
        "description": "Refine and improve existing project ideas",
        "parameters": ["projectContext", "skillLevel", "timeframe"]
      }
      // ... more contexts
    ]
  }
}
```

## Benefits of PromptTemplate Approach

1. **Consistency**: Standardized prompts ensure consistent AI responses
2. **Flexibility**: Easy to modify prompts without changing code
3. **Context-Aware**: Different templates for different use cases
4. **Parameterization**: Dynamic content based on user input
5. **Maintainability**: Centralized prompt management

## Best Practices

1. **Choose the Right Context**: Select the most appropriate context for your use case
2. **Provide Relevant Parameters**: Include as much relevant information as possible
3. **Use Conversations**: For complex discussions, maintain conversation history
4. **Handle Errors**: Always check the response status and handle errors gracefully
5. **Session Management**: Use sessionId to maintain conversation continuity

## Example Frontend Integration

```javascript
// React example
const sendMessage = async (message, context = 'general', params = {}) => {
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        context,
        additionalParams: params
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.response;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

// Usage
const response = await sendMessage(
  "Help me choose technologies for my project",
  "technology",
  {
    projectType: "E-commerce Website",
    experienceLevel: "intermediate",
    requirements: "User auth, payment processing, admin panel"
  }
);
```

This enhanced system provides much more targeted and useful responses based on the specific context and parameters provided!
