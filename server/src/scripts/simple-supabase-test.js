const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Check environment variables
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'present (not showing for security)' : 'missing');

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' });
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Database has profiles:', data);
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  }
}

testConnection(); 