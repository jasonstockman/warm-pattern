-- Create a function that can be called to create profiles
CREATE OR REPLACE FUNCTION create_profile_for_id(user_id uuid, user_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (user_id, user_name)
  ON CONFLICT (id) DO UPDATE
  SET username = user_name;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN others THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_profile_for_id TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_for_id TO service_role; 