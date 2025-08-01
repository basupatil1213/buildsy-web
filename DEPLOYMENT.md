# Buildsy Deployment Guide

This guide covers deploying Buildsy to various platforms.

## 🌐 Platform Options

### Backend Deployment
- **Railway** (Recommended) - Easy Node.js deployment
- **Heroku** - Popular PaaS platform
- **DigitalOcean App Platform** - Simple and scalable
- **Vercel** - For serverless functions (requires adaptation)
- **AWS/GCP/Azure** - More complex but highly scalable

### Frontend Deployment
- **Vercel** (Recommended) - Optimized for React/Vite
- **Netlify** - Great for static sites
- **GitHub Pages** - Free for public repos
- **DigitalOcean Static Sites** - Simple deployment

## 🚀 Quick Deployment

### Option 1: Railway + Vercel (Recommended)

**Backend on Railway:**
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

**Frontend on Vercel:**
1. Connect your GitHub repo to Vercel
2. Set build settings: `cd frontend && npm run build`
3. Set environment variables in Vercel dashboard
4. Deploy automatically on git push

### Option 2: All-in-One with DigitalOcean

**App Platform:**
1. Create new app from GitHub
2. Add both backend and frontend as components
3. Set environment variables
4. Deploy

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables documented
- [ ] Database schema applied to production database
- [ ] API endpoints tested locally
- [ ] Frontend builds without errors
- [ ] All dependencies listed in package.json

### Environment Variables

**Backend (.env):**
```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env.production):**
```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_API_URL=https://your-backend-domain.com
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Production Database Setup

1. **Create production Supabase project**
2. **Run the SQL schema from README.md**
3. **Set up Row Level Security policies**
4. **Configure authentication providers if needed**

### Domain Configuration

1. **Backend**: Update CORS settings for production domain
2. **Frontend**: Update API URLs to production backend
3. **Supabase**: Add production domains to allowed origins

## 🔧 Platform-Specific Instructions

### Railway Deployment

1. **Create Railway account** and connect GitHub
2. **Create new project** from your repo
3. **Configure environment variables:**
   - Go to Variables tab
   - Add all backend environment variables
4. **Deploy:**
   - Railway automatically detects Node.js
   - Uses `npm start` command
   - Provides public URL

### Vercel Deployment

1. **Create Vercel account** and connect GitHub
2. **Import project** and select frontend folder
3. **Configure build settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `frontend`
4. **Set environment variables** in Vercel dashboard
5. **Deploy** automatically on git push

### Heroku Deployment

1. **Create Heroku app**
2. **Set buildpack:** `heroku/nodejs`
3. **Set environment variables:** `heroku config:set KEY=VALUE`
4. **Deploy:** `git push heroku main`

### DigitalOcean App Platform

1. **Create new app** from GitHub
2. **Configure components:**
   - **Backend Service:**
     - Source: `/backend`
     - Build: `npm install`
     - Run: `npm start`
     - Port: 3001
   - **Frontend Static Site:**
     - Source: `/frontend`
     - Build: `npm run build`
     - Output: `dist`
3. **Set environment variables** for each component
4. **Deploy**

## 🔒 Security Considerations

### Production Settings
- Use strong JWT secrets (32+ characters)
- Enable HTTPS only
- Set secure CORS origins
- Use production Supabase keys
- Enable rate limiting if needed

### Environment Variables
- Never commit .env files
- Use platform-specific secret management
- Rotate keys regularly
- Use different keys for staging/production

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `GET /health`
- Monitor API response times
- Track error rates
- Monitor database connections

### Logging
- Use structured logging in production
- Monitor application logs
- Set up error tracking (Sentry, etc.)
- Monitor Supabase usage

### Updates
- Regular dependency updates
- Security patches
- Database migrations
- Feature deployments

## 🚨 Troubleshooting

### Common Issues

**CORS Errors:**
- Check FRONTEND_URL in backend environment
- Verify Supabase allowed origins
- Ensure proper protocol (https/http)

**Database Connection:**
- Verify Supabase credentials
- Check RLS policies
- Ensure user permissions

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies installed
- Review build logs for specific errors

**Authentication Issues:**
- Verify Supabase configuration
- Check JWT secret consistency
- Ensure auth providers configured

### Support Resources
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)

## 🎯 Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images and assets

### Backend
- Enable response compression
- Implement caching strategies
- Optimize database queries
- Use connection pooling

### Database
- Regular VACUUM and ANALYZE
- Monitor query performance
- Optimize indexes
- Consider read replicas for scale

---

**Happy Deploying! 🚀**
