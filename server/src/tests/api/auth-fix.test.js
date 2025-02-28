// In the profile creation section:

// Check if profile was created
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if no rows

if (!profile || profileError) {
  console.warn(`⚠️ Profile creation issue: ${profileError ? profileError.message : 'Profile not found'}`);
  
  // Create profile manually since trigger didn't work
  const username = testEmail.split('@')[0];
  try {
    // Explicitly use service role to bypass RLS
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username
      });
    
    if (createProfileError) {
      throw new Error(`Failed to create profile: ${createProfileError.message}`);
    }
    
    console.log('✅ Manually created profile');
  } catch (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
} else {
  console.log('✅ Profile automatically created by trigger');
} 