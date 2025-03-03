# Deployment Guide

This guide explains how to deploy the Warm Pattern application to production environments.

## Overview

The Warm Pattern application is deployed in two parts:
1. Backend API (Node.js server)
2. Frontend Web Application (Next.js)

We'll use the following services:
- Railway for backend deployment
- Vercel for frontend deployment
- Supabase for database and authentication

## Prerequisites

- GitHub repository with your code
- Supabase account and project
- Railway account
- Vercel account
- Domain name (optional)

## Backend Deployment (Railway)

Railway is a deployment platform that makes it easy to deploy Node.js applications.

### Step 1: Connect your GitHub Repository

1. Sign in to [Railway](https://railway.app/)
2. Click on "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the branch you want to deploy (usually `main` or `master`)

### Step 2: Configure the Project

1. Set the root directory to `server` (since our backend is in the server folder)
2. Set the start command to `node index.js`
3. Configure environment variables (see below)

### Step 3: Set Environment Variables

Go to the "Variables" tab and add the following environment variables:

```
NODE_ENV=production
PORT=8080
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
PLAID_CLIENT_ID=<your-plaid-client-id>
PLAID_SECRET_PRODUCTION=<your-plaid-production-secret>
PLAID_ENV=production
PLAID_PRODUCTS=transactions
PLAID_COUNTRY_CODES=US
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 4: Deploy

1. Railway will automatically deploy your application
2. You can view logs in the "Deployments" tab
3. Once deployed, you can find your API URL in the "Settings" tab

## Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying Next.js applications.

### Step 1: Connect your GitHub Repository

1. Sign in to [Vercel](https://vercel.com/)
2. Click on "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `client` (since our frontend is in the client folder)

### Step 2: Configure Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_API_URL=<your-railway-api-url>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Step 3: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend application
3. Once deployed, you'll receive a URL for your frontend

## Domain Configuration (Optional)

### Custom Domain for Backend (Railway)

1. In Railway, go to your project settings
2. Click on "Domains"
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing to the Railway domain

### Custom Domain for Frontend (Vercel)

1. In Vercel, go to your project settings
2. Click on "Domains"
3. Add your custom domain (e.g., `app.yourdomain.com` or `yourdomain.com`)
4. Configure DNS settings with your domain provider:
   - Add a CNAME record pointing to `cname.vercel-dns.com`

## CI/CD Setup

Both Railway and Vercel support continuous deployment from GitHub:

1. When you push to your deployment branch (e.g., `main`), both platforms automatically rebuild and deploy your applications
2. You can configure branch previews for testing changes before merging to main

## Monitoring and Maintenance

### Backend Monitoring (Railway)

1. Use Railway's built-in logs to monitor your application
2. Set up alerts for failed deployments

### Frontend Monitoring (Vercel)

1. Use Vercel Analytics to monitor page performance
2. Configure error monitoring in Vercel

### Database Monitoring (Supabase)

1. Use Supabase's dashboard to monitor database performance
2. Set up backups for your database

## Rollback Procedure

If you need to roll back to a previous version:

### Railway Rollback

1. Go to the "Deployments" tab
2. Find the previous successful deployment
3. Click "Redeploy"

### Vercel Rollback

1. Go to the "Deployments" tab
2. Find the previous successful deployment
3. Click the three dots menu and select "Promote to Production"

## Security Considerations

1. Ensure all secrets and API keys are stored as environment variables, never in code
2. Use appropriate RLS policies in Supabase to protect data
3. Configure CORS properly to prevent unauthorized API access
4. Regularly update dependencies to patch security vulnerabilities

## Troubleshooting

### Common Issues

1. **API Connection Issues**: Verify environment variables and CORS settings
2. **Database Connection Issues**: Check Supabase service key and URL
3. **Authentication Problems**: Verify Supabase configuration and RLS policies

For more detailed troubleshooting, check application logs in Railway and Vercel. 