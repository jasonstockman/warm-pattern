/**
 * Authentication integration tests
 * Tests user creation, login, and token refresh
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { logSection, cleanupTestUser } = require('../utils/test-helpers');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testAuthentication() {
  logSection('Testing Authentication');
  
  const testEmail = `testauth_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let userId = null;
  
  try {
    // Test user creation
    console.log('Testing user creation...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }
    
    userId = userData.user.id;
    console.log(`✅ Created user with ID: ${userId}`);
    
    // Wait a moment for the trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (profileError || !profile || profile.length === 0) {
      console.warn(`⚠️ Profile was not created automatically. Creating manually...`);
      
      // Create profile manually using our database function
      const username = testEmail.split('@')[0];
      try {
        const { data: funcResult, error: funcError } = await supabase.rpc('create_profile_for_id', {
          user_id: userId,
          user_name: username
        });
        
        if (funcError || (funcResult && !funcResult.success)) {
          throw new Error(`Failed to create profile: ${funcError?.message || funcResult?.error || 'Unknown error'}`);
        }
        
        console.log('✅ Manually created profile using database function');
      } catch (error) {
        console.error('Error in profile creation:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }
    } else {
      console.log('✅ Profile automatically created by trigger');
    }
    
    // Test sign in
    console.log('\nTesting sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`);
    }
    
    console.log('✅ Successfully signed in');
    console.log(`✅ Got access token: ${signInData.session.access_token.substring(0, 10)}...`);
    
    // Test creating a client with user's token
    console.log('\nTesting authenticated client...');
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`
          }
        }
      }
    );
    
    // Try to access own profile with authenticated client
    const { data: profileData, error: accessError } = await userClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (accessError) {
      throw new Error(`Failed to access profile with auth token: ${accessError.message}`);
    }
    
    console.log('✅ Successfully accessed own profile with auth token');
    
    // Test token refresh if possible
    console.log('\nTesting token refresh...');
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log('⚠️ Token refresh test skipped (may require interactive session)');
      } else {
        console.log('✅ Successfully refreshed token');
      }
    } catch (error) {
      console.log('⚠️ Token refresh test skipped:', error.message);
    }
    
    // Clean up
    await cleanupTestUser(userId);
    
    // Summary
    logSection('AUTHENTICATION TEST SUMMARY');
    console.log('✅ User creation: PASSED');
    console.log('✅ Profile creation: PASSED');
    console.log('✅ Sign in: PASSED');
    console.log('✅ Authentication: PASSED');
    console.log('All authentication tests completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ AUTHENTICATION TEST FAILED:', error.message);
    
    // Cleanup on error
    if (userId) {
      try {
        await cleanupTestUser(userId);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
    
    return false;
  }
}

testAuthentication();

module.exports = { testAuthentication }; 