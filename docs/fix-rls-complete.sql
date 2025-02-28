-- First, enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Remove ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous access" ON profiles;
DROP POLICY IF EXISTS "Public access" ON profiles;

DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Service role can manage all items" ON items;
DROP POLICY IF EXISTS "Service role can manage all tables" ON items;
DROP POLICY IF EXISTS "Allow anonymous access" ON items;
DROP POLICY IF EXISTS "Public access" ON items;

DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Service role can manage all accounts" ON accounts;
DROP POLICY IF EXISTS "Service role can manage all tables" ON accounts;
DROP POLICY IF EXISTS "Allow anonymous access" ON accounts;
DROP POLICY IF EXISTS "Public access" ON accounts;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can manage all transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can manage all tables" ON transactions;
DROP POLICY IF EXISTS "Allow anonymous access" ON transactions;
DROP POLICY IF EXISTS "Public access" ON transactions;

DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Service role can manage all assets" ON assets;
DROP POLICY IF EXISTS "Service role can manage all tables" ON assets;
DROP POLICY IF EXISTS "Allow anonymous access" ON assets;
DROP POLICY IF EXISTS "Public access" ON assets;

-- Set default policies for authenticated users (user can only access their own data)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own items" 
ON items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" 
ON items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" 
ON accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assets" 
ON assets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" 
ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role policies (can do anything)
CREATE POLICY "Service role can do anything with profiles" 
ON profiles USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do anything with items" 
ON items USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do anything with accounts" 
ON accounts USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do anything with transactions" 
ON transactions USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do anything with assets" 
ON assets USING (true) WITH CHECK (true); 