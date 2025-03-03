# Fastify API Server

This is a Fastify API server that interfaces with a Supabase database and Plaid API. The server provides authentication endpoints and Plaid integration for financial data.

## Features

- TypeScript-based Fastify server with strict type checking
- Supabase database integration
- JWT authentication with refresh tokens
- Plaid API integration for financial data
- OpenAPI/Swagger documentation
- Request validation with Zod
- Structured error handling
- Rate limiting
- CORS and security headers

## Project Structure

```
fastify/
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── db/                 # Database connection and utilities
│   ├── middleware/         # Custom middleware
│   ├── plugins/            # Fastify plugins
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   │   └── plaid/          # Plaid integration services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── app.ts              # Main application setup
├── test/                   # Test files
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- Plaid developer account

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

4. Start the development server:

```bash
npm run dev
```

The server will be available at http://localhost:3000. You can access the Swagger documentation at http://localhost:3000/documentation.

## Available Routes

### Authentication Routes

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/reset-password-request` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/me` - Get current user information
- `POST /auth/logout` - Logout user

### Plaid Routes

- `POST /plaid/create-link-token` - Create a new Plaid link token
- `POST /plaid/exchange-public-token` - Exchange public token for access token
- `POST /plaid/webhook` - Handle Plaid webhooks
- `GET /plaid/accounts` - Get user accounts
- `GET /plaid/transactions` - Get user transactions

### Other Routes

- `GET /health` - Health check endpoint

## Scripts

- `npm run dev` - Start the development server with auto-reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run linting

## Database Schema

The Supabase database should have the following tables:

- `profiles` - User profiles
- `plaid_items` - Plaid items with access tokens
- `plaid_link_tokens` - Plaid link tokens
- `accounts` - User accounts from Plaid
- `transactions` - User transactions from Plaid
- `plaid_webhooks` - Plaid webhook events
- `plaid_transaction_cursors` - Cursor for transaction syncing

## Adding New Routes

1. Create a new route file in `src/routes/`
2. Define request and response schemas with Zod
3. Create route handlers
4. Register the routes in `src/app.ts`

## Error Handling

The server has a global error handler that formats errors consistently. You can throw errors with status codes in your route handlers, and they will be properly formatted.

## Testing

Run the tests with:

```bash
npm test
```

## Security

- All routes are validated with Zod schemas
- Authentication is handled with JWT tokens
- Security headers are added with Helmet
- Rate limiting is enabled
- CORS is configured for security

## License

MIT 