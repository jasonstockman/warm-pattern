// Update the user creation part:

// Create the missing profile - explicitly using service role to bypass RLS
const { data: newProfile, error: createError } = await supabase
  .from('profiles')
  .insert({
    id: userId,
    username: username
  })
  .select(); 