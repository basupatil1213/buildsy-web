# Web Development Final Project - *Buildsy*

Submitted by: **Basavaraj Patil**

This web app: **Buildsy is an AI-powered project idea generator and community platform that helps developers discover, create, and share side project ideas. Users can generate personalized project suggestions using AI, manage their project ideas in a personal dashboard, and engage with a community of builders through voting, commenting, and collaboration.**

Time spent: **50** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - ✅ AI-powered project idea generator with form inputs for skills, interests, and time constraints
  - ✅ Manual project creation form with title, description, category, and tech stack
  - ✅ Form supports adding additional content like features, requirements, and implementation notes
  - ✅ External links can be added for project references
- [x] **Web app includes a home feed displaying previously created posts**
  - ✅ Personal dashboard displays user's project ideas with creation time, title, and status
  - ✅ Community page shows public projects from all users with upvotes/downvotes count  
  - ✅ Project cards show essential info: title, description, tech stack, difficulty, category
  - ✅ Clicking on a project directs to detailed project page
- [x] **Users can view posts in different ways**
  - ✅ Users can sort projects by creation time, upvotes, or alphabetically
  - ✅ Advanced filtering by category (Web Dev, Mobile, AI/ML, Game Dev, etc.)
  - ✅ Filter by difficulty level (beginner, intermediate, advanced)
  - ✅ Search functionality for projects by title and description
  - ✅ Personal vs. community project views
- [x] **Users can interact with each post in different ways**
  - ✅ Dedicated project detail pages with complete information including content, tech stack, features
  - ✅ Commenting system for community projects with threaded discussions
  - ✅ Upvote/downvote functionality for community projects
  - ✅ Users can vote multiple times and change their votes
  - ✅ Real-time vote count updates

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - ✅ Project owners can edit all project details from a dedicated edit form
  - ✅ Projects can be deleted by their creators from the project detail page
  - ✅ Edit functionality includes updating status, visibility, and all metadata

The following **optional** features are implemented:

- [x] **Web app implements authentication**
  - ✅ Full user authentication system using Supabase Auth
  - ✅ Secure signup/signin with email verification
  - ✅ Session management and protected routes
  - ✅ Users can only edit and delete their own projects
  - ✅ User profile integration with projects and comments
- [x] **Users can repost/reference previous projects**
  - ✅ Projects can be marked as public/private for sharing
  - ✅ Community projects are discoverable by all users
  - ✅ Project linking through the community platform
- [x] **Users can customize the interface**
  - ✅ Multiple view modes (personal dashboard vs. community feed)
  - ✅ Customizable project visibility (public/private toggle)
  - ✅ Advanced filtering and sorting options
  - ✅ Status-based project organization (idea, planning, in progress, completed, on hold)
- [x] **Users can add more characteristics to their projects**
  - ✅ Rich project categorization (Web Dev, Mobile, AI/ML, Game Dev, DevOps, etc.)
  - ✅ Difficulty levels and time estimates
  - ✅ Technology stack tagging
  - ✅ Feature lists and implementation requirements
  - ✅ Project status tracking throughout development lifecycle
- [x] **Web app displays loading animations**
  - ✅ Loading spinners for all async operations
  - ✅ Skeleton loading for better UX during data fetching
  - ✅ Progress indicators for form submissions

The following **additional** features are implemented:

- [x] **AI-Powered Project Generation**
  - ✅ Integration with OpenAI GPT for intelligent project idea generation
  - ✅ Contextual conversations that understand user preferences and constraints
  - ✅ Structured project output with tech stack, features, and difficulty assessment
  - ✅ Personalized recommendations based on user input

- [x] **Advanced Project Management**
  - ✅ Project status tracking (idea → planning → in progress → completed → on hold)
  - ✅ Estimated duration and completion tracking
  - ✅ Private/public project visibility controls
  - ✅ Comprehensive project metadata management

- [x] **Community Features**
  - ✅ Public project showcase for community discovery
  - ✅ Voting system with upvotes/downvotes
  - ✅ Threaded commenting system for project discussions
  - ✅ Real-time vote count updates

- [x] **Enhanced User Experience**
  - ✅ Responsive design with Tailwind CSS
  - ✅ Advanced error handling with contextual error messages
  - ✅ Real-time form validation
  - ✅ Intuitive navigation and user flows
  - ✅ Professional UI with consistent design system

- [x] **Technical Architecture**
  - ✅ Full-stack application with React 19 frontend and Node.js backend
  - ✅ PostgreSQL database with Supabase integration
  - ✅ RESTful API design with proper authentication middleware
  - ✅ Secure data validation and sanitization

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='http://i.imgur.com/EB7s2e8.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

<!-- Replace this with whatever GIF tool you used! -->
GIF created with [Kap](https://getkap.co/)

## Tech Stack

**Frontend:**
- React 19.1.0 with modern hooks and context
- React Router DOM 7.7.1 for navigation
- Tailwind CSS 4.1.11 for responsive styling
- Lucide React for consistent iconography
- Vite for fast development and building

**Backend:**
- Node.js with Express.js framework
- Supabase for authentication and PostgreSQL database
- OpenAI API integration for AI-powered features
- RESTful API architecture with JWT authentication
- Langchain

**Database:**
- PostgreSQL (via Supabase) with optimized schema
- Real-time subscriptions for live updates
- Efficient indexing for search and filtering

## Features Overview

### 🤖 AI-Powered Idea Generation
- Conversational AI interface for project brainstorming
- Personalized recommendations based on skills and interests
- Structured project output with comprehensive details

### 📊 Personal Dashboard
- Project management with status tracking
- Search and filter capabilities
- Statistics and progress visualization

### 🌟 Community Platform
- Discover projects from other developers
- Vote and comment on community projects
- Share your own projects publicly

### 🔒 Secure Authentication
- Email verification and secure sessions
- Protected routes and user-specific data
- Privacy controls for project visibility

## Notes

### Challenges Encountered

1. **Authentication Flow Complexity**: Implementing a robust authentication system with Supabase required careful handling of session management, email verification, and protected routes. The integration between frontend auth context and backend middleware needed multiple iterations to ensure security and user experience.

2. **AI Integration**: Integrating OpenAI's API for project generation required developing a sophisticated prompt engineering system to ensure consistent, structured output. Handling rate limits and API costs while maintaining responsive user experience was challenging.

3. **Database Schema Design**: Designing a flexible schema that supports both personal project management and community features required careful planning. Implementing the voting system with proper user vote tracking while maintaining performance was complex.

4. **Real-time Updates**: Implementing real-time vote count updates and comment threads required careful state management and optimistic UI updates to provide smooth user experience.

5. **Error Handling**: Creating a comprehensive error handling system that provides meaningful feedback for different types of errors (network, validation, authentication) across both frontend and backend required extensive testing and refinement.

### Technical Decisions

- **Supabase over Firebase**: Chose Supabase for PostgreSQL compatibility and better relational data handling
- **React Context over Redux**: Used React Context API for simpler state management given the app's scope
- **Tailwind CSS**: Enabled rapid prototyping and consistent design system

## License

    Copyright 2025 Basavaraj Patil

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.