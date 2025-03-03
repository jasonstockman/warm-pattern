# Fastify API Server Implementation Plan

## Overview

This document outlines the step-by-step plan to build a TypeScript-based Fastify API server that interfaces with a Supabase database. The API will support both authenticated and unauthenticated endpoints, using JWT tokens for authentication. Additionally, the server will integrate with Plaid to support link token creation and management.

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

## Fastify Plugins

We will utilize the following Fastify plugins to enhance our server functionality:

### Core Plugins

- [x] **@fastify/jwt**: For JWT authentication with token expiration and refresh capabilities
- [x] **@fastify/cors**: To enable proper Cross-Origin Resource Sharing
- [x] **@fastify/helmet**: For adding security headers and protecting against common web vulnerabilities
- [x] **@fastify/rate-limit**: To protect API endpoints from abuse with rate limiting
- [x] **@fastify/swagger**: For generating OpenAPI documentation
- [x] **@fastify/swagger-ui**: To serve an interactive API documentation interface
- [x] **@fastify/sensible**: Adds useful utilities like HTTP errors and standard responses
- [x] **@fastify/env**: For environment variable validation and loading
- [x] **@fastify/cookie**: To handle cookies for refresh token storage
- [x] **@fastify/request-context**: For request-scoped storage

### Community Plugins

- [x] **fastify-zod**: For request/response validation using Zod schemas
- [x] **fastify-type-provider-zod**: Fastify type provider for Zod to ensure type safety
- [ ] **fastify-supabase**: For easy integration with Supabase
- [x] **fastify-print-routes**: Development utility to print all available routes
- [x] **fastify-raw-body**: For handling raw request bodies (useful for webhooks)

## Implementation Steps

### 1. Project Setup

- [x] 1.1. Create the project directory structure
- [x] 1.2. Initialize a new Node.js project with `npm init -y`
- [x] 1.3. Install TypeScript and initialize tsconfig.json
- [x] 1.4. Set up Git repository with appropriate .gitignore
- [x] 1.5. Create a README.md with project documentation

### 2. Install Dependencies

- [x] 2.1. Install Fastify and related packages:

  - [x] fastify
  - [x] @fastify/cors
  - [x] @fastify/jwt
  - [x] @fastify/swagger
  - [x] @fastify/swagger-ui
  - [x] @fastify/helmet
  - [x] @fastify/rate-limit
  - [x] @fastify/sensible
  - [x] @fastify/env
  - [x] @fastify/cookie
  - [x] @fastify/request-context
  - [x] fastify-plugin
  - [x] fastify-zod
  - [x] fastify-type-provider-zod
  - [ ] fastify-supabase
  - [x] fastify-print-routes
  - [x] fastify-raw-body
  - [x] pino (for logging)
- [x] 2.2. Install Supabase client:

  - [x] @supabase/supabase-js
- [x] 2.3. Install Plaid client:

  - [x] plaid
- [x] 2.4. Install development dependencies:

  - [x] typescript
  - [x] ts-node
  - [x] nodemon
  - [x] @types/node
  - [x] jest (for testing)
  - [x] supertest (for API testing)

### 3. Configure TypeScript

- [x] 3.1. Set up tsconfig.json with strict type checking
- [x] 3.2. Configure paths and output directories
- [x] 3.3. Set up source maps for debugging

### 4. Environment Configuration

- [x] 4.1. Create .env and .env.example files
- [x] 4.2. Add environment variables:

  - [x] PORT
  - [x] NODE_ENV
  - [x] JWT_SECRET
  - [x] JWT_EXPIRATION (1 hour)
  - [x] JWT_REFRESH_EXPIRATION
  - [x] SUPABASE_URL
  - [x] SUPABASE_SERVICE_ROLE_KEY
  - [x] SUPABASE_ANON_KEY
  - [x] PLAID_CLIENT_ID
  - [x] PLAID_SECRET
  - [x] PLAID_ENV (sandbox/development/production)
- [x] 4.3. Create a config module to load and validate environment variables

### 5. Database Connection

- [x] 5.1. Copy the Supabase types to src/types/supabase.ts
- [x] 5.2. Create a database client module in src/db/client.ts
- [x] 5.3. Implement connection pooling and error handling
- [x] 5.4. Create database utility functions for common operations

### 6. Authentication System

- [x] 6.1. Set up JWT plugin with Fastify (configure token to expire in 1 hour)
- [x] 6.2. Create authentication middleware:

  - [x] verifyJWT.ts - Verify JWT tokens
  - [x] requireAuth.ts - Require authentication for protected routes
  - [x] optionalAuth.ts - Optional authentication for mixed routes
- [x] 6.3. Implement user authentication services:

  - [x] signup
  - [x] login
  - [x] token refresh (implement refresh tokens)
  - [x] password reset
- [x] 6.4. Create authentication controller and routes

### 7. Request Validation

- [x] 7.1. Set up Zod schemas for request validation
- [x] 7.2. Create validation schemas for each API endpoint
- [x] 7.3. Implement custom error responses for validation failures

### 8. Plaid Integration

- [x] 8.1. Set up Plaid client configuration
- [x] 8.2. Implement Plaid service with the following functionality:

  - [x] createLinkToken - Create a Plaid link token
  - [x] getLinkToken - Get link token information
  - [x] exchangePublicToken - Exchange public token for access token
  - [x] storeItemData - Store Plaid item data in the database
- [x] 8.3. Create Plaid controller with endpoints:

  - [x] POST /plaid/create-link-token - Create a new link token (authenticated)
  - [x] POST /plaid/exchange-public-token - Exchange public token for access token (authenticated)
  - [x] GET /plaid/link-token/:id - Get link token details (authenticated)
- [x] 8.4. Implement webhook handling for Plaid events:

  - [x] POST /plaid/webhook - Handle Plaid webhooks

### 9. API Routes Implementation

#### 9.1. Profiles

- [x] 9.1.1. Create profile types and interfaces
- [x] 9.1.2. Implement profile service with CRUD operations
- [x] 9.1.3. Create profile controller
- [x] 9.1.4. Define profile routes:
  - [x] GET /profiles/:id - Get profile (authenticated)
  - [x] POST /profiles - Create profile (unauthenticated for signup)
  - [x] PUT /profiles/:id - Update profile (authenticated)
  - [x] DELETE /profiles/:id - Delete profile (authenticated)

#### 9.2. Accounts

- [x] 9.2.1. Create account types and interfaces
- [x] 9.2.2. Implement account service with CRUD operations
- [x] 9.2.3. Create account controller
- [x] 9.2.4. Define account routes:
  - [x] GET /accounts - List user accounts (authenticated)
  - [x] GET /accounts/:id - Get account details (authenticated)
  - [x] POST /accounts - Create account (authenticated)
  - [x] PUT /accounts/:id - Update account (authenticated)
  - [x] DELETE /accounts/:id - Delete account (authenticated)

#### 9.3. Items

- [x] 9.3.1. Create item types and interfaces
- [x] 9.3.2. Implement item service with CRUD operations
- [x] 9.3.3. Create item controller
- [x] 9.3.4. Define item routes:
  - [x] GET /items - List user items (authenticated)
  - [x] GET /items/:id - Get item details (authenticated)
  - [x] POST /items - Create item (authenticated)
  - [x] PUT /items/:id - Update item (authenticated)
  - [x] DELETE /items/:id - Delete item (authenticated)

#### 9.4. Assets

- [x] 9.4.1. Create asset types and interfaces
- [x] 9.4.2. Implement asset service with CRUD operations
- [x] 9.4.3. Create asset controller
- [x] 9.4.4. Define asset routes:
  - [x] GET /assets - List user assets (authenticated)
  - [x] GET /assets/:id - Get asset details (authenticated)
  - [x] POST /assets - Create asset (authenticated)
  - [x] PUT /assets/:id - Update asset (authenticated)
  - [x] DELETE /assets/:id - Delete asset (authenticated)

#### 9.5. Transactions

- [x] 9.5.1. Create transaction types and interfaces
- [x] 9.5.2. Implement transaction service with CRUD operations
- [x] 9.5.3. Create transaction controller
- [x] 9.5.4. Define transaction routes:
  - [x] GET /transactions - List user transactions (authenticated)
  - [x] GET /transactions/:id - Get transaction details (authenticated)
  - [x] POST /transactions - Create transaction (authenticated)
  - [x] PUT /transactions/:id - Update transaction (authenticated)
  - [x] DELETE /transactions/:id - Delete transaction (authenticated)

### 10. Error Handling

- [x] 10.1. Create custom error classes
- [x] 10.2. Implement global error handler
- [x] 10.3. Set up structured error responses with consistent format

### 11. Logging

- [x] 11.1. Configure Pino logger
- [x] 11.2. Implement request logging middleware
- [x] 11.3. Set up different log levels for development and production

### 12. API Documentation

- [x] 12.1. Set up Swagger/OpenAPI documentation
- [x] 12.2. Document all routes and schemas
- [x] 12.3. Create a documentation endpoint

### 13. Security Measures

- [x] 13.1. Implement rate limiting
- [x] 13.2. Set up CORS configuration
- [x] 13.3. Add security headers
- [x] 13.4. Implement input sanitization

### 14. Testing

- [x] 14.1. Set up Jest for testing
- [x] 14.2. Create unit tests for services
- [x] 14.3. Create integration tests for API endpoints
- [x] 14.4. Set up test database environment

### 15. Deployment Preparation

- [x] 15.1. Create build scripts
- [x] 15.2. Set up Docker configuration
- [x] 15.3. Create deployment documentation

## Main Functional Modules

### 1. Accounts Module (Section 9.2)
- [x] Create account types and interfaces
- [x] Implement account service with CRUD operations
- [x] Create account controller
- [x] Define RESTful account routes (GET, POST, PUT, DELETE)

### 2. Items Module (Section 9.3)
- [x] Create item types and interfaces
- [x] Implement item service with CRUD operations
- [x] Create item controller
- [x] Define RESTful item routes (GET, POST, PUT, DELETE)

### 3. Assets Module (Section 9.4)
- [x] Create asset types and interfaces
- [x] Implement asset service with CRUD operations
- [x] Create asset controller
- [x] Define RESTful asset routes (GET, POST, PUT, DELETE)

## Documentation Requirements

### Route Documentation Standards

Each API route must be thoroughly documented using the following standards:

- [x] 1. **OpenAPI/Swagger Documentation**
  - [x] Every route must include complete OpenAPI annotations
  - [x] Use @fastify/swagger for automatic OpenAPI specification generation
  - [x] Schemas must be defined for all request bodies, parameters, and responses
- [x] 2. **Endpoint Documentation Template**
  For each endpoint, document the following:
  - [x] **Purpose**: Brief description of what the endpoint does
  - [x] **Endpoint**: HTTP method and URL path
  - [x] **Authentication**: Whether authentication is required
  - [x] **Request Parameters**: Path, query, and header parameters with types and descriptions
  - [x] **Request Body**: Schema with proper types and descriptions for each field
  - [x] **Response Codes**: All possible HTTP status codes with descriptions
  - [x] **Response Body**: Schema with proper types and descriptions for each field
  - [x] **Examples**: Example requests and responses in JSON format
  - [x] **Error Responses**: Possible error codes and their response formats
- [x] 3. **TypeScript Interface Documentation**
  - [x] All interfaces must be properly documented with JSDoc comments
  - [x] Each property should have a description
  - [x] Include validation rules and constraints in the documentation
- [x] 4. **Code Documentation**
  - [x] All controller methods must have JSDoc comments
  - [x] Document input parameters and return values
  - [x] Include business logic explanations for complex operations
- [x] 5. **README Documentation**
  - [x] Create a dedicated API documentation in the project README
  - [x] Include a quickstart guide for API consumers
  - [x] Document authentication requirements and flows

### Documentation Generation and Maintenance

- [x] 1. **Automatic Documentation Generation**
  - [x] Set up automatic generation of OpenAPI documentation
  - [x] Configure Swagger UI for interactive documentation
  - [x] Ensure documentation is generated as part of the build process
- [ ] 2. **Documentation Testing**
  - [ ] Validate generated OpenAPI specifications
  - [ ] Ensure examples in documentation are valid and consistent with actual responses
  - [ ] Include documentation validation in CI/CD pipelines
- [ ] 3. **Version Control**
  - [ ] Document API versions properly
  - [ ] Include changelog for API changes
  - [ ] Maintain backward compatibility notes

## Testing Strategy

### Unit Testing

- [ ] 1. **Service Layer Testing**
  - [ ] Test each service method in isolation
  - [ ] Mock external dependencies (database, Plaid API)
  - [ ] Verify business logic works as expected
  - [ ] Test error handling and edge cases
- [ ] 2. **Validation Testing**
  - [ ] Test schema validation rules
  - [ ] Ensure validation errors are properly formatted
  - [ ] Test different input combinations
- [ ] 3. **Utility Function Testing**
  - [ ] Test utility functions with various inputs
  - [ ] Ensure high code coverage for utility functions

### Integration Testing

- [ ] 1. **API Endpoint Testing**
  - [ ] Test each endpoint with valid inputs
  - [ ] Test authentication and authorization
  - [ ] Verify response structure and status codes
  - [ ] Test pagination, filtering, and sorting where applicable
- [ ] 2. **Error Handling Testing**
  - [ ] Test endpoints with invalid inputs
  - [ ] Verify appropriate error responses
  - [ ] Test rate limiting and security features
- [ ] 3. **Database Integration Testing**
  - [ ] Test database queries and transactions
  - [ ] Verify data integrity across operations
  - [ ] Test with realistic data volumes

### End-to-End Testing

- [ ] 1. **Authentication Flow Testing**
  - [ ] Test complete authentication flows
  - [ ] Verify token issuance and validation
  - [ ] Test refresh token functionality
- [ ] 2. **Plaid Integration Testing**
  - [ ] Test complete Plaid integration flows
  - [ ] Test webhook handling
  - [ ] Verify data synchronization

### Test Data Management

- [ ] 1. **Test Fixtures**
  - [ ] Create reusable test fixtures for common test scenarios
  - [ ] Generate test data programmatically
  - [ ] Maintain separate test data for different test suites
- [ ] 2. **Test Database**
  - [ ] Use a separate database for testing
  - [ ] Reset database state before/after tests
  - [ ] Use transactions to isolate test cases

### Test Coverage Requirements

- [ ] 1. **Coverage Targets**
  - [ ] Minimum 85% code coverage for services and controllers
  - [ ] 100% coverage for critical paths (authentication, payment processing)
  - [ ] Document areas excluded from coverage requirements
- [ ] 2. **Test Reporting**
  - [ ] Generate coverage reports during CI/CD
  - [ ] Track coverage trends over time
  - [ ] Alert on coverage regressions

### API Endpoint Test Checklist

For each API endpoint, implement tests that verify:

- [ ] 1. **Basic Functionality**
  - [ ] Successful operation with valid inputs
  - [ ] Proper handling of optional parameters
  - [ ] Correct output format and content
- [ ] 2. **Authentication and Authorization**
  - [ ] Proper enforcement of authentication requirements
  - [ ] Authorization rules correctly applied
  - [ ] Token validation and expiration handling
- [ ] 3. **Input Validation**
  - [ ] Proper validation of required fields
  - [ ] Type checking and constraints
  - [ ] Handling of invalid inputs
- [ ] 4. **Error Handling**
  - [ ] Appropriate error responses for various error conditions
  - [ ] Consistent error format
  - [ ] Informative error messages
- [ ] 5. **Performance**
  - [ ] Response time within acceptable limits
  - [ ] Proper handling of large datasets
  - [ ] Rate limiting functionality

## Implementation Details

### Authentication Flow

1. User signs up or logs in
2. Server validates credentials and issues a JWT token (expires in 1 hour) and a refresh token
3. Client includes the token in the Authorization header for subsequent requests
4. Server validates the token and authorizes access to protected resources
5. When the access token expires, client uses refresh token to get a new access token

### Plaid Integration Flow

1. Client requests a link token from the server
2. Server creates a link token using Plaid API and returns it to the client
3. Client uses the link token to initialize Plaid Link
4. User completes the Plaid Link flow and client receives a public token
5. Client sends the public token to the server
6. Server exchanges the public token for an access token using Plaid API
7. Server stores the access token and item information in the database
8. Server uses the access token to fetch account and transaction data from Plaid

### Request Validation Flow

1. Request arrives at the server
2. Fastify routes the request to the appropriate handler
3. Request body/params/query are validated against Zod schemas
4. If validation fails, a 400 Bad Request response is returned
5. If validation passes, the request is processed by the controller

### Database Interaction Flow

1. Controller receives a validated request
2. Controller calls the appropriate service method
3. Service method interacts with the Supabase client
4. Results are returned to the controller
5. Controller formats the response and sends it to the client

## Plaid Data Storage

The Plaid integration will utilize the existing database tables:

1. `items` table - Stores Plaid items with access tokens
2. `accounts` table - Stores account data from Plaid
3. `transactions` table - Stores transaction data from Plaid

This allows for seamless integration between the Plaid API and our application's data model.

## Future Improvements

These are additional areas to enhance the implementation plan based on identified weaknesses:

### 1. Refresh Token Security Considerations

- [x] **Refresh Token Storage**: 
  - [x] Server-side: Store refresh tokens in a database with proper encryption
  - [x] Client-side: Store tokens in HTTP-only, secure cookies with SameSite attributes
  - [ ] Enable token fingerprinting for device/IP association

- [x] **Token Rotation Policy**:
  - [x] Implement single-use refresh tokens that generate a new refresh token with each use
  - [ ] Define token family tracking to detect and prevent replay attacks
  - [x] Set appropriate expiration periods (access tokens: 15-60 minutes; refresh tokens: 1-14 days)

- [ ] **Compromise Mitigation**:
  - [ ] Create a token blacklist/blocklist for immediate invalidation of compromised tokens
  - [ ] Implement automated detection for suspicious token usage patterns
  - [ ] Define cascading revocation (revoking a refresh token invalidates all child tokens)
  - [ ] Add ability for users to view and terminate active sessions from their account

- [x] **Additional Security Measures**:
  - [x] Add CSRF protection for token endpoints
  - [ ] Include IP binding or fingerprinting options for high-security scenarios
  - [ ] Establish clear audit logging for all token events (issuance, refresh, revocation)

### 2. Rate Limiting Implementation Details

- [x] **Tiered Rate Limiting**:
  - [x] Define different rate limits based on user authentication status
  - [ ] Implement varying limits by user roles or subscription tiers
  - [ ] Create separate rate limit pools for critical vs non-critical endpoints

- [ ] **Endpoint-Specific Strategies**:
  - [ ] Higher limits for read operations, lower limits for write operations
  - [ ] Special consideration for authentication endpoints to prevent brute force attacks
  - [ ] Custom limits for high-demand or resource-intensive endpoints

- [x] **Implementation Details**:
  - [x] Specify the rate limit window (e.g., requests per minute, hour, or day)
  - [ ] Define storage mechanisms for rate limit counters (Redis recommended for distributed environments)
  - [x] Configure whether limits apply per IP, per user, or a combination of both

- [x] **Response Handling**:
  - [x] Add proper HTTP 429 responses with clear error messaging
  - [x] Include rate limit headers in all responses
  - [ ] Implement exponential backoff recommendations in error responses
  - [x] Create documentation for clients on how to handle rate limiting gracefully

### 3. Error Handling Taxonomy

- [x] **Error Categorization**:
  - [x] Define standardized error types (ValidationError, AuthenticationError, etc.)
  - [ ] Create consistent error codes with namespaces (AUTH-001, DB-004, etc.)
  - [x] Categorize errors by severity level (fatal, error, warning)

- [x] **Error Structure**:
  - [x] Define a consistent JSON error response format
  - [x] Include appropriate level of detail based on environment
  - [ ] Consider i18n support for error messages

- [x] **Error Propagation**:
  - [x] Define how errors translate between layers
  - [x] Create middleware for global error handling and formatting
  - [x] Establish logging requirements for different error types

- [x] **Error Documentation**:
  - [x] Create a dedicated error code reference documentation
  - [x] Include troubleshooting guides for common errors
  - [x] Provide code examples showing proper error handling for API consumers

### 4. Architecture Diagrams

- [ ] **Required Diagram Types**:
  - [ ] High-level system architecture diagram
  - [ ] API service interaction diagram
  - [ ] Authentication flow sequence diagram
  - [ ] Data flow diagrams for key operations
  - [ ] Database entity relationship diagrams

- [ ] **Diagram Standards**:
  - [ ] Use consistent notation (e.g., C4 model, UML)
  - [ ] Include legends explaining symbols and relationships
  - [ ] Maintain diagrams alongside code in version control
  - [ ] Use tooling that allows diagrams to be easily updated

- [ ] **Usage Strategy**:
  - [ ] Include diagrams in README and technical documentation
  - [ ] Create separate architectural decision records (ADRs) with supporting diagrams
  - [ ] Update diagrams when architecture changes
  - [ ] Include diagrams in onboarding materials for new developers

### 5. Authentication Flow Documentation

- [x] **Authentication Scenarios to Document**:
  - [x] Initial signup/registration flow
  - [x] Standard login flow with username/password
  - [ ] Social login integration options (if applicable)
  - [ ] Multi-factor authentication (MFA) flows
  - [x] Password reset/recovery process
  - [x] Token refresh mechanics with sequence diagrams
  - [ ] Account verification workflows
  - [x] Session termination (logout) process on single device vs. all devices

- [x] **Session Management Documentation**:
  - [x] Describe how sessions are tracked across devices
  - [x] Document session timeout behaviors
  - [ ] Explain how concurrent logins are handled
  - [x] Detail how session revocation works

- [x] **Client Integration Guides**:
  - [x] Provide code examples for common client platforms
  - [x] Document HTTP headers and cookies requirements
  - [x] Include error handling examples for authentication failures
  - [x] Create troubleshooting guides for common authentication issues

- [x] **Security Considerations Documentation**:
  - [x] Document token storage recommendations for various client types
  - [x] Explain rate limiting for authentication endpoints
  - [ ] Describe account lockout policies
  - [x] Detail auditing and logging for authentication events
