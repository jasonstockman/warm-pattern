# Environment Variables

This document lists all environment variables required for the Warm Pattern application.

## Core Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development, production) | Yes | development |
| `PORT` | Port for the server to listen on | No | 8080 |

## Supabase Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | URL of your Supabase instance | Yes | None |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | None |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes | None |

## Plaid API Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PLAID_CLIENT_ID` | Plaid API client ID | Yes | None |
| `PLAID_SECRET_SANDBOX` | Plaid API secret for sandbox | Yes (for sandbox) | None |
| `PLAID_SECRET_DEVELOPMENT` | Plaid API secret for development | Yes (for development) | None |
| `PLAID_SECRET_PRODUCTION` | Plaid API secret for production | Yes (for production) | None |
| `PLAID_ENV` | Plaid environment (sandbox, development, production) | Yes | sandbox |
| `PLAID_PRODUCTS` | Comma-separated list of Plaid products | No | transactions |
| `PLAID_COUNTRY_CODES` | Comma-separated list of country codes | No | US |
| `PLAID_REDIRECT_URI` | OAuth redirect URI | No | None |

## Frontend Settings

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API | Yes | http://localhost:8080 |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase instance | Yes | None |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | None |

## Setup Instructions

1. Create a `.env` file in the root directory of the project
2. Copy the contents of `.env.example` to `.env`
3. Fill in the values for each environment variable

Example `.env` file:

```
# Core Settings
NODE_ENV=development
PORT=8080

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Plaid API Configuration
PLAID_CLIENT_ID=your-client-id
PLAID_SECRET_SANDBOX=your-sandbox-secret
PLAID_ENV=sandbox
PLAID_PRODUCTS=transactions
PLAID_COUNTRY_CODES=US

# Frontend Settings
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
``` 