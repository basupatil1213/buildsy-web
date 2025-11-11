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
Buildsy Backend API

Overview
--------
Node.js/Express REST API powering Buildsy's project generation, CRUD operations and AI chat endpoints.

Features
--------
- Project CRUD
- AI chat endpoints for idea generation
- Supabase integration for persistence
- Input validation and error handling

Tech stack
----------
Node.js, Express, Supabase (Postgres), OpenAI, Joi

Getting started
---------------
1. npm install
2. Copy .env.example to .env and set required keys (OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)
3. npm run dev

API
---
- POST /api/chat/message
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

License
-------
See project LICENSE (Apache 2.0)
