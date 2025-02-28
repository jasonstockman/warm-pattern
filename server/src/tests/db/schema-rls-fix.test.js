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

// Try various tables to be thorough
const { data: itemsData, error: itemsError } = await anonClient
  .from('items')
  .select('*')
  .limit(1);

const { data: accountsData, error: accountsError } = await anonClient
  .from('accounts')
  .select('*')
  .limit(1);

// Check all results
const anonAccessBlocked = 
  (anonError || (anonData && anonData.length === 0)) &&
  (itemsError || (itemsData && itemsData.length === 0)) &&
  (accountsError || (accountsData && accountsData.length === 0));

if (anonAccessBlocked) {
  console.log('✅ RLS policies working: Anonymous client cannot access data');
  results.rls = true;
} else {
  console.warn('⚠️ Warning: Anonymous users can access data - RLS is not set up correctly');
  results.rls = false;
  results.success = false;
} 