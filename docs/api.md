# API Documentation

This document describes the APIs available in the Warm Pattern application.

## Authentication Endpoints

### Sign Up

Creates a new user account.

```
POST /auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### Sign In

```
POST /auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

## User Endpoints

### Get All Users

Retrieves all users.

```
GET /users
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "user1",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Create User

Creates a new user.

```
POST /users
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "username": "newuser"
}
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "newuser",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Get User By ID

Retrieves user information for a single user.

```
GET /users/:userId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
```json
[
  {
    "id": 1,
    "username": "user1",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Get Items by User

Retrieves all items associated with a user.

```
GET /users/:userId/items
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
```json
[
  {
    "id": 1,
    "institution_id": "ins_1",
    "plaid_item_id": "item_1",
    "status": "good",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Get Accounts by User

Retrieves all accounts associated with a user.

```
GET /users/:userId/accounts
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
```json
[
  {
    "id": 1,
    "item_id": 1,
    "name": "Checking Account",
    "mask": "1234",
    "type": "depository",
    "subtype": "checking",
    "current_balance": 1000.50,
    "available_balance": 950.75
  }
]
```

### Get Transactions by User

Retrieves all transactions associated with a user.

```
GET /users/:userId/transactions
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
```json
[
  {
    "id": 1,
    "account_id": 1,
    "name": "Grocery Store",
    "amount": 75.21,
    "date": "2023-04-15",
    "pending": false,
    "category": ["Food and Drink", "Groceries"]
  }
]
```

### Delete User

Deletes a user and its related items.

```
DELETE /users/:userId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
- Status: 204 No Content

## Session Endpoints

### Create Session

Logs in a user by username.

```
POST /sessions
```

**Request Body:**
```json
{
  "username": "user1"
}
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "user1",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

## Plaid Link Token Endpoints

### Create Link Token

Creates a Plaid Link token to initialize the Link flow. This token is required to launch the Plaid Link interface.

```
POST /link-token
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "userId": 1,
  "itemId": null
}
```

**Response:**
```json
{
  "link_token": "link-sandbox-12345",
  "expiration": "2023-04-15T00:00:00Z",
  "request_id": "request-id"
}
```

## Item Endpoints (Plaid Integration)

### Create Item (Exchange Public Token)

Exchanges a public token received from Plaid Link for an access token and creates a new Item. This is step 3 of the Plaid Token Exchange Flow. 

The flow works as follows:
1. Create a link token using `/link-token`
2. Initialize Plaid Link with the token, which returns a public token on success
3. Exchange the public token for an access token using this endpoint

```
POST /items
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "publicToken": "public-sandbox-12345",
  "institutionId": "ins_123",
  "userId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "institution_id": "ins_123",
  "plaid_item_id": "item_123",
  "status": "good",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Item

Retrieves a single item.

```
GET /items/:itemId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `itemId` (number): The ID of the item

**Response:**
```json
{
  "id": 1,
  "institution_id": "ins_123",
  "plaid_item_id": "item_123",
  "status": "good",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Update Item

Updates a single item.

```
PUT /items/:itemId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `itemId` (number): The ID of the item

**Request Body:**
```json
{
  "status": "good"
}
```

**Response:**
```json
{
  "id": 1,
  "institution_id": "ins_123",
  "plaid_item_id": "item_123",
  "status": "good",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Delete Item

Deletes a single item and related accounts and transactions.

```
DELETE /items/:itemId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `itemId` (number): The ID of the item

**Response:**
- Status: 204 No Content

### Get Accounts by Item

Retrieves all accounts associated with an item.

```
GET /items/:itemId/accounts
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `itemId` (number): The ID of the item

**Response:**
```json
[
  {
    "id": 1,
    "item_id": 1,
    "name": "Checking Account",
    "mask": "1234",
    "type": "depository",
    "subtype": "checking",
    "current_balance": 1000.50,
    "available_balance": 950.75
  }
]
```

### Get Transactions by Item

Retrieves all transactions associated with an item.

```
GET /items/:itemId/transactions
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `itemId` (number): The ID of the item

**Response:**
```json
[
  {
    "id": 1,
    "account_id": 1,
    "name": "Grocery Store",
    "amount": 75.21,
    "date": "2023-04-15",
    "pending": false,
    "category": ["Food and Drink", "Groceries"]
  }
]
```

### Reset Login (Sandbox only)

Forces an Item into an ITEM_LOGIN_REQUIRED error state.

```
POST /items/sandbox/item/reset_login
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "itemId": 1
}
```

**Response:**
```json
{
  "request_id": "request-id"
}
```

## Account Endpoints

### Get Transactions by Account

Fetches all transactions for a single account.

```
GET /accounts/:accountId/transactions
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `accountId` (number): The ID of the account

**Response:**
```json
[
  {
    "id": 1,
    "account_id": 1,
    "name": "Grocery Store",
    "amount": 75.21,
    "date": "2023-04-15",
    "pending": false,
    "category": ["Food and Drink", "Groceries"]
  }
]
```

## Link Event Endpoints

### Create Link Event

Creates a new link event. Used to track Plaid Link events for analytics.

```
POST /link-event
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "userId": 1,
  "type": "success",
  "link_session_id": "session-123",
  "request_id": "request-123",
  "error_type": null,
  "error_code": null
}
```

**Response:**
- Status: 200 OK

## Asset Endpoints

### Create Asset

Creates a new asset.

```
POST /assets
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "userId": 1,
  "description": "House",
  "value": 250000
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "description": "House",
  "value": 250000,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Assets by User

Retrieves all assets associated with a user.

```
GET /assets/:userId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `userId` (number): The ID of the user

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "description": "House",
    "value": 250000,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Delete Asset

Deletes an asset by its ID.

```
DELETE /assets/:assetId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `assetId` (number): The ID of the asset

**Response:**
- Status: 204 No Content

## Institution Endpoints

### Get Institutions

Fetches institutions from the Plaid API.

```
GET /institutions
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `count` (number, optional, default: 200): The number of institutions to return
- `offset` (number, optional, default: 0): The number of institutions to skip

**Response:**
```json
[
  {
    "institution_id": "ins_123",
    "name": "Bank of America",
    "products": ["auth", "transactions"],
    "country_codes": ["US"],
    "logo": "https://plaid.com/logos/bofa.png"
  }
]
```

### Get Institution by ID

Fetches a single institution from the Plaid API.

```
GET /institutions/:instId
```

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Path Parameters:**
- `instId` (string): The institution ID

**Response:**
```json
{
  "institution_id": "ins_123",
  "name": "Bank of America",
  "products": ["auth", "transactions"],
  "country_codes": ["US"],
  "logo": "https://plaid.com/logos/bofa.png"
}
```

## Service Endpoints

### Get Ngrok URL

Returns the URL of the current public endpoint generated by ngrok.

```
GET /services/ngrok
```

**Response:**
```json
{
  "url": "https://1234abcd.ngrok.io"
}
```

### Webhook Handler

Handles incoming webhooks from Plaid.

```
POST /services/webhook
```

**Request Body:**
```json
{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "SYNC_UPDATES_AVAILABLE",
  "item_id": "item_123",
  "initial_update_complete": true
}
```

**Response:**
```json
{
  "status": "ok"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or token invalid
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Plaid Token Exchange Flow

The application implements the Plaid Token Exchange Flow as described in the [Plaid documentation](https://plaid.com/docs/api/items/#token-exchange-flow):

1. **Create a Link Token**: Call the `/link-token` endpoint to get a link token.
2. **Initialize Plaid Link**: Use the link token to initialize the Plaid Link interface.
3. **Exchange Public Token**: When the user completes the Plaid Link flow, a public token is returned. Exchange this public token for an access token using the `/items` endpoint.

This flow is implemented in the client application using the `LaunchLink` component, which handles steps 2 and 3 automatically once provided with a link token. 