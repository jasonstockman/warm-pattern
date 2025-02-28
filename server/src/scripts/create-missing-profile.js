const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAndFixProfile(userId) {
  console.log(`Checking user ID: ${userId}`);
  
  try {
    // First check if user exists in auth.users
    console.log('Fetching user from auth system...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('❌ Error fetching auth user:', authError.message);
      return;
    }
    
    if (!authUser || !authUser.user) {
      console.error('❌ User not found in auth system');
      return;
    }
    
    console.log('✅ Found in auth system:', authUser.user.email);
    
    // Now check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ Error checking profile:', profileError.message);
      return;
    }
    
    if (!profile || profile.length === 0) {
      console.log('⚠️ Profile not found - creating it now...');
      
      // Create username from email (remove domain part)
      const username = authUser.user.email.split('@')[0];
      
      // Create the missing profile USING DATABASE FUNCTION
      const { data: newProfile, error: createError } = await supabase.rpc('create_profile_for_id', {
        user_id: userId,
        user_name: username
      });
      
      if (createError) {
        console.error('❌ Failed to create profile:', createError.message);
        return;
      }
      
      console.log('✅ Profile created successfully with username:', username);
    } else {
      console.log('✅ Profile already exists');
    }
    
    // Verify the profile now exists and can be selected
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError.message);
      return;
    }
    
    console.log('✅ Profile verified:', verifyProfile);
    console.log('\nYou can now run the test script again with this user.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Use the existing user ID
const userId = 'ae47accf-78b6-4b8a-841c-73738c78152d';
checkAndFixProfile(userId); 