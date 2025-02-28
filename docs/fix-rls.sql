-- First, ensure RLS is enabled for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies before recreating them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;

-- Drop any anonymous access policies that might exist
DROP POLICY IF EXISTS "Allow anonymous access" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous access" ON items;
DROP POLICY IF EXISTS "Allow anonymous access" ON accounts;
DROP POLICY IF EXISTS "Allow anonymous access" ON transactions;
DROP POLICY IF EXISTS "Allow anonymous access" ON assets;

-- Add policies for authenticated users
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own items" 
ON items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own accounts" 
ON accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own assets" 
ON assets FOR SELECT USING (auth.uid() = user_id);

-- Drop service role policies before recreating them
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all tables" ON items;
DROP POLICY IF EXISTS "Service role can manage all tables" ON accounts;
DROP POLICY IF EXISTS "Service role can manage all tables" ON transactions;
DROP POLICY IF EXISTS "Service role can manage all tables" ON assets;

-- Create service role policies
CREATE POLICY "Service role can manage profiles" 
ON profiles USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all tables" 
ON items USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all tables" 
ON accounts USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all tables" 
ON transactions USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all tables" 
ON assets USING (true) WITH CHECK (true); 