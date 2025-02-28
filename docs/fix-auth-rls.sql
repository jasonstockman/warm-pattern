-- Add a policy allowing users to create their own profile with auth.uid matching id
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also allow service role to create profiles for users during tests
DROP POLICY IF EXISTS "Service role can create profile for user" ON profiles;
CREATE POLICY "Service role can create profile for user" 
ON profiles FOR INSERT
WITH CHECK (true); 