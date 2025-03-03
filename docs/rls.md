# Row Level Security (RLS) Configuration

This document explains how Row Level Security is configured in the Supabase database for the Warm Pattern application.

## Overview

Row Level Security (RLS) is a feature in PostgreSQL that allows us to restrict which rows a user can access. In this application, RLS is a critical component of the Supabase authentication system, ensuring that users can only access their own data.

## Authentication Integration

RLS policies use Supabase's `auth.uid()` function to get the authenticated user's ID. This integration provides automatic security enforcement at the database level based on the authentication state managed by Supabase Auth.

Key benefits:
- Security rules defined close to the data
- No need to implement access control in application code
- Protection against accidental data exposure

## Default Policy

By default, tables in the database have RLS enabled with no policies, which means no access is granted to any user.

## Table Policies

### Profiles Table

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow service role to access all profiles
CREATE POLICY "Service role can manage profiles"
ON profiles
USING (true)
WITH CHECK (true);
```

### Items Table

```sql
-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own items
CREATE POLICY "Users can view their own items"
ON items
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own items
CREATE POLICY "Users can insert their own items"
ON items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to access all items
CREATE POLICY "Service role can manage all items"
ON items
USING (true)
WITH CHECK (true);
```

### Accounts Table

```sql
-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own accounts
CREATE POLICY "Users can view their own accounts"
ON accounts
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to access all accounts
CREATE POLICY "Service role can manage all accounts"
ON accounts
USING (true)
WITH CHECK (true);
```

### Transactions Table

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow service role to access all transactions
CREATE POLICY "Service role can manage all transactions"
ON transactions
USING (true)
WITH CHECK (true);
```

### Assets Table

```sql
-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own assets
CREATE POLICY "Users can view their own assets"
ON assets
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own assets
CREATE POLICY "Users can insert their own assets"
ON assets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to access all assets
CREATE POLICY "Service role can manage all assets"
ON assets
USING (true)
WITH CHECK (true);
```

## Fixing RLS Issues

If you encounter RLS errors when running tests or scripts, run the following SQL in the Supabase SQL Editor:

```sql
-- Fix RLS permissions for service role
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles" 
ON profiles
USING (true)
WITH CHECK (true);

-- Same for other tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all tables" ON items;
CREATE POLICY "Service role can manage all tables" 
ON items
USING (true)
WITH CHECK (true);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all tables" ON accounts;
CREATE POLICY "Service role can manage all tables" 
ON accounts
USING (true)
WITH CHECK (true);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all tables" ON transactions;
CREATE POLICY "Service role can manage all tables" 
ON transactions
USING (true)
WITH CHECK (true);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all tables" ON assets;
CREATE POLICY "Service role can manage all tables" 
ON assets
USING (true)
WITH CHECK (true);
``` 