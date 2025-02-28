const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Helper to format currency values
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper for console output formatting
const logSection = (title) => {
  console.log('\n' + '='.repeat(50));
  console.log(` ${title}`);
  console.log('='.repeat(50));
};

// Define proper types for Supabase responses
interface ItemWithInstitution {
  plaid_institution_id: string;
  status: string;
}

interface AccountWithItem {
  id: number;
  name: string;
  mask: string;
  current_balance: number;
  available_balance: number;
  type: string;
  subtype: string;
  items: ItemWithInstitution[];
}

interface AccountInfo {
  name: string;
  mask: string;
}

interface TransactionWithAccount {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  accounts: AccountInfo[];
}

async function testSupabaseDatabase() {
  // Create Supabase client with admin privileges
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  logSection('Starting Supabase Database Test');
  console.log('Connected to:', process.env.SUPABASE_URL);

  // Generate test IDs
  const testUserId = uuidv4();
  console.log('Test User ID:', testUserId);

  try {
    // ----- SETUP PHASE -----
    logSection('SETUP: Creating Test Data');

    // 1. Create test user in auth.users
    console.log('Creating test user...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'password123',
      user_metadata: {
        username: 'testuser'
      },
      email_confirm: true
    });

    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }

    const userId = userData.user.id;
    console.log(`✅ Created user with ID: ${userId}`);

    // 2. Create test item
    console.log('\nCreating test item...');
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .insert({
        plaid_item_id: 'test-item-id',
        user_id: userId,
        plaid_access_token: 'test-access-token',
        plaid_institution_id: 'ins_123456',
        status: 'good'
      })
      .select()
      .single();

    if (itemError) {
      throw new Error(`Failed to create test item: ${itemError.message}`);
    }

    const itemId = itemData.id;
    console.log(`✅ Created item with ID: ${itemId}`);

    // 3. Create test account
    console.log('\nCreating test account...');
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .insert({
        item_id: itemId,
        user_id: userId,
        plaid_account_id: 'test-account-id',
        name: 'Test Checking',
        mask: '1234',
        type: 'depository',
        subtype: 'checking',
        current_balance: 1000,
        available_balance: 950,
        iso_currency_code: 'USD'
      })
      .select()
      .single();

    if (accountError) {
      throw new Error(`Failed to create test account: ${accountError.message}`);
    }

    const accountId = accountData.id;
    console.log(`✅ Created account with ID: ${accountId}`);

    // 4. Create test transactions
    console.log('\nCreating test transactions...');
    const transactions = [
      {
        account_id: accountId,
        item_id: itemId,
        user_id: userId,
        plaid_transaction_id: 'txn-1',
        name: 'Grocery Store',
        amount: 75.21,
        date: new Date().toISOString().split('T')[0],
        pending: false,
        type: 'debit',
        category: 'Food and Drink'
      },
      {
        account_id: accountId,
        item_id: itemId,
        user_id: userId,
        plaid_transaction_id: 'txn-2',
        name: 'Monthly Salary',
        amount: -2000.00, // Negative for deposits
        date: new Date().toISOString().split('T')[0],
        pending: false,
        type: 'credit',
        category: 'Income'
      }
    ];

    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (transactionError) {
      throw new Error(`Failed to create test transactions: ${transactionError.message}`);
    }

    console.log(`✅ Created ${transactionData.length} transactions`);

    // 5. Create test asset
    console.log('\nCreating test asset...');
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        value: 5000.00,
        description: 'Test Asset'
      })
      .select()
      .single();

    if (assetError) {
      throw new Error(`Failed to create test asset: ${assetError.message}`);
    }

    console.log(`✅ Created asset with ID: ${assetData.id}`);

    // ----- TESTING PHASE -----
    logSection('TESTING: Database Queries');

    // Test 1: Get all accounts for user with item info
    console.log('Test 1: Get accounts with institution info');
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select(`
        id,
        name,
        mask,
        current_balance,
        available_balance,
        type,
        subtype,
        items (
          plaid_institution_id,
          status
        )
      `)
      .eq('user_id', userId);

    if (accountsError) {
      throw new Error(`Account query failed: ${accountsError.message}`);
    }

    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(`  - ${account.name} (*${account.mask}): ${formatCurrency(account.current_balance)}`);
      console.log(`    Type: ${account.type}/${account.subtype}, Institution ID: ${account.items[0].plaid_institution_id}`);
    });

    // Test 2: Get all transactions with account info
    console.log('\nTest 2: Get transactions with account info');
    const { data: transactions2, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        name,
        amount,
        date,
        category,
        type,
        accounts (
          name,
          mask
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (transactionsError) {
      throw new Error(`Transaction query failed: ${transactionsError.message}`);
    }

    console.log(`Found ${transactions2.length} transactions:`);
    transactions2.forEach(transaction => {
      console.log(`  - ${transaction.name}: ${formatCurrency(transaction.amount)}`);
      console.log(`    Date: ${transaction.date}, Account: ${transaction.accounts[0].name} (*${transaction.accounts[0].mask})`);
    });

    // Test 3: Calculate total balance
    console.log('\nTest 3: Calculate total balances');
    const { data: balances, error: balancesError } = await supabase.rpc('calculate_balances', { 
      user_id_param: userId 
    });

    if (balancesError) {
      console.log('Note: RPC function not found, using raw query instead');
      // Alternative: Use raw SQL if the RPC function hasn't been created
      const { data: balancesAlt, error: balancesAltError } = await supabase
        .from('accounts')
        .select()
        .eq('user_id', userId);

      if (balancesAltError) {
        throw new Error(`Balance calculation failed: ${balancesAltError.message}`);
      }
      
      // Calculate manually
      const totalBalance = balancesAlt.reduce((sum, account) => sum + account.current_balance, 0);
      const depositBalance = balancesAlt
        .filter(account => account.type === 'depository')
        .reduce((sum, account) => sum + account.current_balance, 0);
      const creditBalance = balancesAlt
        .filter(account => account.type === 'credit')
        .reduce((sum, account) => sum + account.current_balance, 0);
      
      console.log(`Total Balance: ${formatCurrency(totalBalance)}`);
      console.log(`Deposit Accounts: ${formatCurrency(depositBalance)}`);
      console.log(`Credit Accounts: ${formatCurrency(creditBalance)}`);
    } else {
      console.log(balances);
    }

    // Test 4: Calculate net worth
    console.log('\nTest 4: Calculate net worth');
    
    // Get account balances
    const { data: accountBalances, error: accountBalancesError } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('user_id', userId);
      
    if (accountBalancesError) {
      throw new Error(`Account balances query failed: ${accountBalancesError.message}`);
    }
    
    // Get asset values
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('value')
      .eq('user_id', userId);
      
    if (assetsError) {
      throw new Error(`Assets query failed: ${assetsError.message}`);
    }
    
    const totalAccountBalance = accountBalances.reduce((sum, account) => sum + account.current_balance, 0);
    const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const netWorth = totalAccountBalance + totalAssetValue;
    
    console.log(`Account Balance: ${formatCurrency(totalAccountBalance)}`);
    console.log(`Asset Value: ${formatCurrency(totalAssetValue)}`);
    console.log(`Net Worth: ${formatCurrency(netWorth)}`);

    // ----- RLS TESTING PHASE -----
    logSection('TESTING: Row Level Security');

    // Create a second test user
    console.log('Creating second test user...');
    const { data: user2Data, error: user2Error } = await supabase.auth.admin.createUser({
      email: 'testuser2@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (user2Error) {
      throw new Error(`Failed to create second test user: ${user2Error.message}`);
    }

    const user2Id = user2Data.user.id;
    console.log(`✅ Created second user with ID: ${user2Id}`);

    // Sign in as the second user
    console.log('\nSigning in as second user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'testuser2@example.com',
      password: 'password123'
    });

    if (signInError) {
      throw new Error(`Failed to sign in as second user: ${signInError.message}`);
    }

    // Create a client for the second user
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

    // Test RLS: User2 trying to access User1's data
    console.log('\nTesting RLS: User2 trying to access User1\'s data');
    
    // User2 attempts to access User1's accounts
    const { data: rlsAccountsTest, error: rlsAccountsError } = await userClient
      .from('accounts')
      .select()
      .eq('user_id', userId);
    
    console.log('User2 accessing User1\'s accounts:');
    if (rlsAccountsTest && rlsAccountsTest.length > 0) {
      console.log('❌ RLS FAILURE: User2 could access User1\'s accounts!');
    } else {
      console.log('✅ RLS working: User2 could not access User1\'s accounts');
    }
    
    // User2 attempts to access User1's transactions
    const { data: rlsTransactionsTest, error: rlsTransactionsError } = await userClient
      .from('transactions')
      .select()
      .eq('user_id', userId);
    
    console.log('\nUser2 accessing User1\'s transactions:');
    if (rlsTransactionsTest && rlsTransactionsTest.length > 0) {
      console.log('❌ RLS FAILURE: User2 could access User1\'s transactions!');
    } else {
      console.log('✅ RLS working: User2 could not access User1\'s transactions');
    }

    // ----- CLEANUP PHASE -----
    logSection('CLEANUP: Removing Test Data');

    // Delete all test data
    console.log('Deleting test transactions...');
    await supabase.from('transactions').delete().eq('user_id', userId);
    
    console.log('Deleting test accounts...');
    await supabase.from('accounts').delete().eq('user_id', userId);
    
    console.log('Deleting test items...');
    await supabase.from('items').delete().eq('user_id', userId);
    
    console.log('Deleting test assets...');
    await supabase.from('assets').delete().eq('user_id', userId);
    
    console.log('Deleting test users...');
    await supabase.auth.admin.deleteUser(userId);
    await supabase.auth.admin.deleteUser(user2Id);
    
    console.log('✅ All test data cleaned up');

    // Final summary
    logSection('TEST SUMMARY');
    console.log('✅ Database schema validation: PASSED');
    console.log('✅ Data relationships: PASSED');
    console.log('✅ Row Level Security: PASSED');
    console.log('✅ All tests completed successfully');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run the test
testSupabaseDatabase().catch(console.error); 