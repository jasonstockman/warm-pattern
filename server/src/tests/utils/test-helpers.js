/**
 * Test helper functions to be used across different test files
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Creates a test user with a profile
 * @returns {Promise<{userId: string, email: string}>} The created user's ID and email
 */
async function createTestUser() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }
    
    const userId = userData.user.id;
    
    // Wait a moment for the trigger 
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if profile was created automatically by trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (profileError || !profile || profile.length === 0) {
      // Create profile manually if trigger didn't work
      const username = email.split('@')[0];
      
      // Use the database function
      const { data: funcResult, error: funcError } = await supabase.rpc('create_profile_for_id', {
        user_id: userId,
        user_name: username
      });
      
      if (funcError) {
        console.error('Error creating profile with function:', funcError);
        throw new Error(`Failed to create profile: ${funcError.message}`);
      }
    }
    
    return { userId, email };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Deletes a test user and all associated data
 * @param {string} userId - The user ID to delete
 * @returns {Promise<void>}
 */
async function cleanupTestUser(userId) {
  try {
    // Delete all user data from related tables
    await supabase.from('transactions').delete().eq('user_id', userId);
    await supabase.from('accounts').delete().eq('user_id', userId);
    await supabase.from('items').delete().eq('user_id', userId);
    await supabase.from('assets').delete().eq('user_id', userId);
    
    // Delete profile and auth user
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.admin.deleteUser(userId);
    
    console.log(`✅ Deleted test user ${userId} and all associated data`);
  } catch (error) {
    console.error('Error cleaning up test user:', error);
    throw error;
  }
}

/**
 * Utility function to format currency values
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Helper for console output formatting
 * @param {string} title - The section title
 */
function logSection(title) {
  console.log('\n' + '='.repeat(50));
  console.log(` ${title}`);
  console.log('='.repeat(50));
}

module.exports = {
  createTestUser,
  cleanupTestUser,
  formatCurrency,
  logSection,
  supabase
}; 