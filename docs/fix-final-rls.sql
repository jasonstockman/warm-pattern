-- First step: explicitly disable RLS for the service role
ALTER ROLE service_role BYPASSRLS;

-- Now set up specific policies for the profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do anything with profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can create profile for user" ON profiles;

-- Create specific policies for authenticated users
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- We'll let the BYPASSRLS handle service role permissions 