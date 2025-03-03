# Developer Setup Guide

This guide will help you set up the Warm Pattern project for local development.

## Prerequisites

- Node.js (v14 or higher)
- pnpm (v7 or higher)
- PostgreSQL (if running Supabase locally)
- Git

## Clone the Repository

```bash
git clone https://github.com/your-username/warm-pattern.git
cd warm-pattern
```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the environment variables in `.env` with your credentials:
   - Supabase credentials (URL and anon key for authentication)
   - Plaid API credentials
   - Other configuration settings

For more details, see [Environment Variables](environment.md).

## Install Dependencies

We use pnpm as our package manager. Install the dependencies for both the client and server:

```bash
# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd ../client
pnpm install
```

## Database Setup

If you're using a fresh Supabase instance:

1. Run the database setup script:
   ```bash
   cd server
   node src/scripts/create-schema.js
   ```

2. Verify the database schema:
   ```bash
   node src/tests/db/schema.test.js
   ```

3. If you encounter RLS policy issues, run the SQL provided in `docs/fix-rls.sql` in the Supabase SQL Editor.

## Authentication

This application uses Supabase for authentication. Key features include:

1. Email/Password Authentication: Sign up and login with email and password
2. Session Management: Secure session handling via Supabase Auth
3. Row Level Security: Database access is restricted based on user identity

The authentication flow is implemented in:
- Client: `client/src/contexts/AuthContext.tsx` and `client/src/api/services/authService.ts`
- Server: Auth verification through Supabase client

## Running the Application

### Start the Server

```bash
cd server
pnpm dev
```

The server will start on `http://localhost:8080` (or the port specified in your .env file).

### Start the Client

```bash
cd client
pnpm dev
```

The client will start on `http://localhost:3000`.

## Testing

### Run Database Tests

```bash
cd server
node src/tests/db/schema.test.js   # Test database schema
node src/tests/db/crud.test.js     # Test CRUD operations
```

### Run API Tests

```bash
cd server
node src/tests/api/auth.test.js    # Test authentication
```

### Run All Tests

```bash
cd server
node src/tests/index.js
```

## Common Issues

### RLS Policy Errors

If you encounter errors related to Row Level Security policies, you may need to configure them in Supabase. See the [RLS documentation](./rls.md) for details.

### User Creation Issues

If user creation fails, check if the trigger function for profile creation is working correctly. You can fix it by running:

```bash
cd server
node src/scripts/create-missing-profile.js
```

### Environment Variables Not Loading

Make sure your `.env` file is in the correct location and contains all required variables. The server looks for it in the root directory of the project.

## Deployment

See the [Deployment Guide](./deployment.md) for instructions on deploying the application to production. 