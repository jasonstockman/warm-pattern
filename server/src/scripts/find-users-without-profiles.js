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

async function findUsersWithoutProfiles() {
  console.log('Checking for users without profiles...');
  
  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('No users found in auth system.');
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in auth system.`);
    
    // Get all users from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log(`Found ${profiles ? profiles.length : 0} profiles in profiles table.`);
    
    // Find users without profiles
    const profileIds = new Set((profiles || []).map(p => p.id));
    const usersWithoutProfiles = authUsers.users.filter(user => !profileIds.has(user.id));
    
    console.log(`Found ${usersWithoutProfiles.length} users without profiles.`);
    
    if (usersWithoutProfiles.length > 0) {
      console.log('Users without profiles:');
      usersWithoutProfiles.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}`);
      });
      
      console.log('\nTo create missing profiles, run:');
      console.log('node src/scripts/create-missing-profile.js [user-id]');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

findUsersWithoutProfiles(); 