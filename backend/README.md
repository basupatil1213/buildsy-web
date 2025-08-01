# Buildsy Backend API

A Node.js/Express API for Buildsy - an AI-powered project idea generator that helps users brainstorm, refine, and manage project ideas.

## Features

- 🤖 AI-powered chat for project idea generation
- 📊 Project management with CRUD operations
- 🔍 Search and filter projects
- 🗄️ Supabase integration for data persistence
- ✅ Input validation with Joi
- 🔧 Error handling middleware

## Tech Stack

- **Framework**: Express.js
- **AI/LLM**: LangChain + OpenAI
- **Database**: Supabase (PostgreSQL)
- **Validation**: Joi
- **Environment**: Node.js (ES Modules)

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
```bash
npm install
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Update the `.env` file with your actual values:
   - OpenAI API key
   - Supabase URL and anon key
   - Other configuration values

6. Set up the database schema in Supabase:
   - Run the SQL commands from `database/schema.sql` in your Supabase SQL editor

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Chat Endpoints
- `POST /api/chat/message` - Send a single message
- `POST /api/chat/conversation` - Send conversation with message history
- `POST /chat/` - Legacy endpoint (backward compatibility)

### Project Endpoints
- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get user's projects (with pagination)
- `GET /api/projects/search` - Search projects
- `GET /api/projects/:id` - Get a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

## Request/Response Examples

### Chat Message
```javascript
// POST /api/chat/message
{
  "message": "I want to build a web application but I'm not sure what to create",
  "sessionId": "optional-session-id",
  "userId": "optional-user-id"
}

// Response
{
  "success": true,
  "message": "Chat response generated successfully",
  "data": {
    "response": "AI generated response...",
    "sessionId": "session-id",
    "timestamp": "2025-01-31T..."
  }
}
```

### Create Project
```javascript
// POST /api/projects
{
  "name": "E-commerce Platform",
  "description": "A full-stack e-commerce platform with modern features",
  "techStack": ["React", "Node.js", "PostgreSQL", "Stripe"],
  "category": "Web Development",
  "difficulty": "intermediate",
  "estimatedDuration": "3-4 months",
  "features": ["User authentication", "Product catalog", "Shopping cart", "Payment processing"],
  "requirements": ["Basic React knowledge", "Understanding of REST APIs"]
}

// Response
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "project-uuid",
    "name": "E-commerce Platform",
    // ... other project fields
    "created_at": "2025-01-31T...",
    "updated_at": "2025-01-31T..."
  }
}
```

## Database Schema

### Projects Table
- `id` - UUID primary key
- `name` - Project name (max 100 chars)
- `description` - Project description
- `tech_stack` - Array of technologies
- `category` - Project category
- `difficulty` - beginner/intermediate/advanced
- `estimated_duration` - Time estimate
- `features` - Array of key features
- `requirements` - Array of prerequisites
- `status` - idea/planning/in_progress/completed/on_hold
- `user_id` - Reference to user
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Environment Variables

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_here
```

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Not found errors (404)
- Server errors (500)
- Standardized error response format

## Development Notes

- Uses ES Modules (type: "module" in package.json)
- Implements Row Level Security (RLS) with Supabase
- Structured logging with console timestamps
- Modular architecture with separate controllers, services, and routes

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write descriptive commit messages
5. Test endpoints before submitting PRs
