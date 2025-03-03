# API Routes Documentation

This document provides detailed information about the available API routes in the Fastify server.

## Authentication

### POST /auth/signup

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z",
  "token": "jwt.token.here",
  "refresh_token": "refresh.token.here"
}
```

### POST /auth/login

Authenticates a user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "jwt.token.here",
  "refresh_token": "refresh.token.here",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  }
}
```

### POST /auth/refresh

Refreshes an expired JWT token using a refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh.token.here"
}
```

**Response (200):**
```json
{
  "token": "new.jwt.token.here",
  "refresh_token": "new.refresh.token.here"
}
```

## Profiles

### GET /profiles/:id

Retrieves a user profile by ID.

**Parameters:**
- `id`: Profile ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174001",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

### PUT /profiles/:id

Updates a user profile.

**Parameters:**
- `id`: Profile ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "9876543210"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174001",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "9876543210",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:30:00.000Z"
}
```

## Plaid Integration

### POST /plaid/create-link-token

Creates a Plaid link token for initializing Plaid Link.

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "link_token": "link-sandbox-12345",
  "expiration": "2023-03-01T13:00:00.000Z"
}
```

### POST /plaid/exchange-public-token

Exchanges a public token for an access token.

**Headers:**
- `Authorization`: Bearer token

**Request Body:**
```json
{
  "public_token": "public-sandbox-12345",
  "institution_id": "ins_12345",
  "institution_name": "Bank of America"
}
```

**Response (200):**
```json
{
  "item_id": "123e4567-e89b-12d3-a456-426614174000",
  "access_token": "access-sandbox-12345",
  "institution_id": "ins_12345",
  "institution_name": "Bank of America"
}
```

## Accounts

### GET /accounts

Retrieves all accounts for the authenticated user.

**Headers:**
- `Authorization`: Bearer token

**Query Parameters:**
- `limit` (optional): Maximum number of accounts to return (default: 100)
- `offset` (optional): Number of accounts to skip (default: 0)
- `item_id` (optional): Filter by Plaid item ID

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "item_id": "123e4567-e89b-12d3-a456-426614174001",
    "user_id": "123e4567-e89b-12d3-a456-426614174002",
    "plaid_account_id": "plaid-account-12345",
    "name": "Checking Account",
    "mask": "1234",
    "official_name": "Standard Checking",
    "current_balance": 1000.50,
    "available_balance": 950.75,
    "iso_currency_code": "USD",
    "account_type": "depository",
    "account_subtype": "checking",
    "created_at": "2023-03-01T12:00:00.000Z",
    "updated_at": "2023-03-01T12:00:00.000Z"
  }
]
```

### GET /accounts/:id

Retrieves a specific account by ID.

**Parameters:**
- `id`: Account ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "item_id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174002",
  "plaid_account_id": "plaid-account-12345",
  "name": "Checking Account",
  "mask": "1234",
  "official_name": "Standard Checking",
  "current_balance": 1000.50,
  "available_balance": 950.75,
  "iso_currency_code": "USD",
  "account_type": "depository",
  "account_subtype": "checking",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

## Items

### GET /items

Retrieves all Plaid items for the authenticated user.

**Headers:**
- `Authorization`: Bearer token

**Query Parameters:**
- `limit` (optional): Maximum number of items to return (default: 100)
- `offset` (optional): Number of items to skip (default: 0)
- `institution_id` (optional): Filter by institution ID

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "plaid_item_id": "plaid-item-12345",
    "plaid_institution_id": "ins_12345",
    "institution_name": "Bank of America",
    "status": "good",
    "error": null,
    "created_at": "2023-03-01T12:00:00.000Z",
    "updated_at": "2023-03-01T12:00:00.000Z"
  }
]
```

### GET /items/:id

Retrieves a specific Plaid item by ID.

**Parameters:**
- `id`: Item ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174001",
  "plaid_item_id": "plaid-item-12345",
  "plaid_institution_id": "ins_12345",
  "institution_name": "Bank of America",
  "status": "good",
  "error": null,
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

## Assets

### GET /assets

Retrieves all assets for the authenticated user.

**Headers:**
- `Authorization`: Bearer token

**Query Parameters:**
- `limit` (optional): Maximum number of assets to return (default: 100)
- `offset` (optional): Number of assets to skip (default: 0)
- `user_id` (optional): Filter by user ID
- `type` (optional): Filter by asset type

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Investment Portfolio",
    "type": "investment",
    "value": 50000.00,
    "currency": "USD",
    "institution": "Vanguard",
    "notes": "Retirement account",
    "created_at": "2023-03-01T12:00:00.000Z",
    "updated_at": "2023-03-01T12:00:00.000Z"
  }
]
```

### GET /assets/:id

Retrieves a specific asset by ID.

**Parameters:**
- `id`: Asset ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Investment Portfolio",
  "type": "investment",
  "value": 50000.00,
  "currency": "USD",
  "institution": "Vanguard",
  "notes": "Retirement account",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

## Transactions

### GET /transactions

Retrieves all transactions for the authenticated user.

**Headers:**
- `Authorization`: Bearer token

**Query Parameters:**
- `limit` (optional): Maximum number of transactions to return (default: 100)
- `offset` (optional): Number of transactions to skip (default: 0)
- `user_id` (optional): Filter by user ID
- `account_id` (optional): Filter by account ID
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `category` (optional): Filter by transaction category

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "account_id": "123e4567-e89b-12d3-a456-426614174001",
    "user_id": "123e4567-e89b-12d3-a456-426614174002",
    "plaid_transaction_id": "plaid-tx-12345",
    "category_id": "cat_12345",
    "category": ["Food and Drink", "Coffee Shop"],
    "subcategory": "Coffee Shop",
    "type": "place",
    "name": "Starbucks",
    "amount": 4.99,
    "iso_currency_code": "USD",
    "date": "2023-03-01",
    "pending": false,
    "merchant_name": "Starbucks",
    "payment_channel": "in store",
    "authorized_date": "2023-02-28",
    "created_at": "2023-03-01T12:00:00.000Z",
    "updated_at": "2023-03-01T12:00:00.000Z"
  }
]
```

### GET /transactions/:id

Retrieves a specific transaction by ID.

**Parameters:**
- `id`: Transaction ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "account_id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174002",
  "plaid_transaction_id": "plaid-tx-12345",
  "category_id": "cat_12345",
  "category": ["Food and Drink", "Coffee Shop"],
  "subcategory": "Coffee Shop",
  "type": "place",
  "name": "Starbucks",
  "amount": 4.99,
  "iso_currency_code": "USD",
  "date": "2023-03-01",
  "pending": false,
  "merchant_name": "Starbucks",
  "payment_channel": "in store",
  "authorized_date": "2023-02-28",
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

### POST /transactions

Creates a new transaction.

**Headers:**
- `Authorization`: Bearer token

**Request Body:**
```json
{
  "account_id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174002",
  "plaid_transaction_id": "plaid-tx-12345",
  "category": ["Food and Drink", "Coffee Shop"],
  "name": "Starbucks",
  "amount": 4.99,
  "date": "2023-03-01",
  "pending": false
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "account_id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174002",
  "plaid_transaction_id": "plaid-tx-12345",
  "category": ["Food and Drink", "Coffee Shop"],
  "name": "Starbucks",
  "amount": 4.99,
  "date": "2023-03-01",
  "pending": false,
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:00:00.000Z"
}
```

### PUT /transactions/:id

Updates an existing transaction.

**Parameters:**
- `id`: Transaction ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Request Body:**
```json
{
  "name": "Updated Transaction Name",
  "amount": 5.99,
  "category": ["Food and Drink", "Restaurant"]
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "account_id": "123e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174002",
  "plaid_transaction_id": "plaid-tx-12345",
  "category": ["Food and Drink", "Restaurant"],
  "name": "Updated Transaction Name",
  "amount": 5.99,
  "date": "2023-03-01",
  "pending": false,
  "created_at": "2023-03-01T12:00:00.000Z",
  "updated_at": "2023-03-01T12:30:00.000Z"
}
```

### DELETE /transactions/:id

Deletes a transaction.

**Parameters:**
- `id`: Transaction ID (UUID)

**Headers:**
- `Authorization`: Bearer token

**Response (204):**
No content 