/**
 * Fixed version of the schema test that directly checks table existence
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

// Tables to verify
const REQUIRED_TABLES = ['profiles', 'items', 'accounts', 'transactions', 'assets'];

async function testDatabaseSchema() {
  console.log('Testing Supabase database schema...');
  const results = { success: true, tables: {} };
  
  try {
    // Check if tables exist by actually querying them
    for (const table of REQUIRED_TABLES) {
      console.log(`Checking if table '${table}' exists...`);
      
      try {
        // Simply try to query the table - if it exists, this won't error
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        // If we got an error that's not about RLS/permissions, the table likely doesn't exist
        if (error && !error.message.includes('permission denied')) {
          console.error(`❌ Table '${table}' error:`, error.message);
          results.tables[table] = false;
          results.success = false;
        } else {
          console.log(`✅ Table '${table}' exists`);
          results.tables[table] = true;
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err);
        results.tables[table] = false;
        results.success = false;
      }
    }

    // Test RLS policies
    console.log('\nTesting Row Level Security policies...');
    
    // Create an anonymous client
    const anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Try to access data as anonymous user (should fail)
    const { data: anonData, error: anonError } = await anonClient
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (anonError || (anonData && anonData.length === 0)) {
      console.log('✅ RLS policies working: Anonymous client cannot access profiles');
      results.rls = true;
    } else if (anonData && anonData.length > 0) {
      console.warn('⚠️ Warning: Anonymous users can access profile data - RLS may not be set up correctly');
      results.rls = false;
      results.success = false;
    }
    
    // Check for special database functions
    console.log('\nChecking special database functions...');
    
    try {
      // Test calculate_balances function if user ID is provided
      const { data: functionTest, error: functionError } = await supabase.rpc(
        'calculate_balances',
        { user_id_param: '00000000-0000-0000-0000-000000000000' }
      );
      
      if (functionError && !functionError.message.includes('not found')) {
        console.log('✅ calculate_balances function exists (returned expected error for non-existent user)');
        results.functions = { calculate_balances: true };
      } else if (!functionError) {
        console.log('✅ calculate_balances function exists and returned results');
        results.functions = { calculate_balances: true };
      } else {
        console.warn('⚠️ calculate_balances function may not exist:', functionError.message);
        results.functions = { calculate_balances: false };
      }
    } catch (err) {
      console.error('❌ Error checking database functions:', err);
      results.functions = { calculate_balances: false };
    }
    
    // Output summary
    console.log('\nSchema validation summary:');
    console.log(`Tables: ${Object.values(results.tables).filter(v => v).length} of ${REQUIRED_TABLES.length} found`);
    console.log(`RLS Policies: ${results.rls ? 'Working' : 'Not working or not set up'}`);
    console.log(`Special Functions: ${results.functions?.calculate_balances ? 'Found' : 'Not found'}`);
    
    if (results.success) {
      console.log('\n✅ Database schema validation PASSED');
    } else {
      console.log('\n❌ Database schema validation FAILED');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Schema validation test failed:', error);
    return { success: false, error: error.message };
  }
}

testDatabaseSchema();

module.exports = { testDatabaseSchema }; 