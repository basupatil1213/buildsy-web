# Buildsy - Project Idea Generator & Community Platform

A full-stack application that helps users generate, save, and share side project ideas using AI. Built with React, Node.js, and Supabase.

## 🚀 Features

### Core Features
- **AI-Powered Project Generation**: Generate project ideas based on your interests, skills, and goals
- **Smart Context-Aware Prompts**: Specialized AI prompts for different use cases (general ideas, refinement, technology selection, etc.)
- **User Authentication**: Secure authentication powered by Supabase
- **Project Management**: Save, edit, delete, and organize your project ideas
- **Community Sharing**: Make projects public and discover ideas from other users
- **Voting & Comments**: Engage with the community through voting and commenting
- **Advanced Filtering**: Filter projects by category, difficulty, technology stack, and more

### AI Chat Features
- Context-aware conversations about your projects
- Multiple prompt templates for different scenarios
- Technology recommendations
- Feature suggestions and implementation guidance
- Timeline and planning assistance

### Community Features
- Public project gallery
- Upvote/downvote system
- Nested commenting system
- Project search and filtering
- User profiles and project attribution

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** with Vite
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Supabase Client** for authentication and data
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **LangChain** with OpenAI integration
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Joi** for validation
- **CORS** middleware

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security** policies
- **Optimized indexes** for performance
- **Database views** for complex queries

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/buildsy-web.git
cd buildsy-web
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project
2. Run the database schema setup:

```sql
-- Create the projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    technologies TEXT[],
    features TEXT[],
    estimated_duration TEXT,
    implementation_notes TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the votes table
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type INTEGER CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create the comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user information
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_public ON projects(is_public);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_difficulty ON projects(difficulty);
CREATE INDEX idx_votes_project_id ON votes(project_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Create a view for project details with vote counts
CREATE VIEW project_details AS
SELECT 
    p.*,
    COALESCE(v.upvotes, 0) as upvotes,
    COALESCE(v.downvotes, 0) as downvotes,
    COALESCE(c.comment_count, 0) as comment_count,
    pr.username as author_username
FROM projects p
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(CASE WHEN vote_type = 1 THEN 1 END) as upvotes,
        COUNT(CASE WHEN vote_type = -1 THEN 1 END) as downvotes
    FROM votes 
    GROUP BY project_id
) v ON p.id = v.project_id
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as comment_count
    FROM comments 
    WHERE parent_id IS NULL
    GROUP BY project_id
) c ON p.id = c.project_id
LEFT JOIN profiles pr ON p.user_id = pr.id;

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public projects" ON projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Users can view votes on public projects" ON votes FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = votes.project_id AND (projects.is_public = true OR projects.user_id = auth.uid()))
);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible projects" ON comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = comments.project_id AND (projects.is_public = true OR projects.user_id = auth.uid()))
);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your actual values:
# - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - JWT_SECRET (generate a secure random string)

# Start development server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your actual values:
# - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# - VITE_API_URL (should be http://localhost:3001)

# Start development server
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📁 Project Structure

```
buildsy-web/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── llm/                # AI/LLM integration
│   └── validators/         # Request validation schemas
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── assets/         # Static assets
│   └── public/             # Public files
└── README.md
```

## 🔧 API Endpoints

### Authentication
- All protected routes require `Authorization: Bearer <token>` header

### Chat API
- `POST /api/chat` - AI chat for project ideas and assistance

### Projects API
- `GET /api/projects` - Get user's projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `GET /api/projects/search` - Search projects

### Community API
- `GET /api/community/projects` - Get public projects
- `GET /api/community/projects/:id` - Get project details with comments
- `POST /api/community/projects/:id/vote` - Vote on project (protected)
- `POST /api/community/projects/:id/comments` - Add comment (protected)
- `GET /api/community/projects/:id/comments` - Get project comments

## 🎯 Usage

### Generating Project Ideas

1. **Sign up/Login** to your account
2. **Navigate to Generate Ideas** page
3. **Fill out the form** with your preferences:
   - Interests and goals
   - Skill level
   - Preferred technologies
   - Time commitment
4. **Click Generate** to get AI-powered project suggestions
5. **Save interesting ideas** to your dashboard
6. **Make projects public** to share with the community

### Managing Projects

- **Dashboard**: View all your saved projects
- **Edit Projects**: Update project details, change visibility
- **Delete Projects**: Remove projects you no longer need
- **Toggle Visibility**: Make projects public or private

### Community Interaction

- **Browse Community**: Discover projects shared by other users
- **Vote on Projects**: Upvote or downvote projects
- **Comment**: Share thoughts and feedback
- **Filter & Search**: Find projects by category, difficulty, or keywords

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation using Joi
- **CORS Protection**: Configured for frontend domain
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. Set all environment variables
2. Ensure database is accessible
3. Set `NODE_ENV=production`
4. Deploy using your preferred platform

### Frontend Deployment (Vercel/Netlify)

1. Set environment variables in your deployment platform
2. Update `VITE_API_URL` to your production backend URL
3. Deploy the frontend

### Environment Variables

Make sure to set all required environment variables in your deployment platform:

**Backend:**
- `PORT`, `NODE_ENV`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`

**Frontend:**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for the GPT models
- **Supabase** for the backend infrastructure
- **LangChain** for AI integration
- **Tailwind CSS** for the beautiful UI
- **React** and **Vite** for the frontend framework

## 📞 Support

If you have any questions or need help setting up the project, please open an issue on GitHub.

---

**Happy Building! 🚀**