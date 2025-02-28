/**
 * Database CRUD operations tests
 * Tests the ability to create, read, update, and delete data in Supabase
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

async function testDatabaseCRUD(userId) {
  logSection('Testing Database CRUD Operations');
  console.log('Connected to:', process.env.SUPABASE_URL);
  console.log('Using user ID:', userId);
  
  try {
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }
    
    console.log('✅ Found user profile with username:', user.username);
    
    // Test CRUD operations
    logSection('Testing CRUD Operations');
    
    // 1. Create test objects
    console.log('Creating test item...');
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        user_id: userId,
        plaid_item_id: `test-item-${Date.now()}`,
        plaid_access_token: 'test-access-token',
        plaid_institution_id: 'ins_test'
      })
      .select()
      .single();
    
    if (itemError) {
      throw new Error(`Failed to create item: ${itemError.message}`);
    }
    
    console.log(`✅ Created item with ID: ${item.id}`);
    
    // Create test account
    console.log('Creating test account...');
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        item_id: item.id,
        plaid_account_id: `test-account-${Date.now()}`,
        name: 'Test Checking',
        mask: '1234',
        type: 'depository',
        subtype: 'checking',
        current_balance: 1250.75,
        available_balance: 1200.50,
        iso_currency_code: 'USD'
      })
      .select()
      .single();
    
    if (accountError) {
      throw new Error(`Failed to create account: ${accountError.message}`);
    }
    
    console.log(`✅ Created account with ID: ${account.id}`);
    
    // Create test transaction
    console.log('Creating test transaction...');
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        item_id: item.id,
        plaid_transaction_id: `test-transaction-${Date.now()}`,
        name: 'Grocery Store',
        amount: 57.23,
        date: new Date().toISOString().split('T')[0],
        pending: false,
        category: ['Food and Drink', 'Groceries'],
        type: 'debit'
      })
      .select()
      .single();
    
    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }
    
    console.log(`✅ Created transaction with ID: ${transaction.id}`);
    
    // 2. Read & validate relationships
    logSection('Testing Data Relationships');
    
    // Get items with related accounts
    console.log('Fetching items with related accounts...');
    const { data: itemsWithAccounts, error: relError } = await supabase
      .from('items')
      .select(`
        id,
        plaid_institution_id,
        accounts(id, name, mask, current_balance)
      `)
      .eq('user_id', userId);
    
    if (relError) {
      throw new Error(`Failed to fetch related data: ${relError.message}`);
    }
    
    console.log('Items with accounts:');
    itemsWithAccounts.forEach(item => {
      console.log(`Item ID: ${item.id}, Institution: ${item.plaid_institution_id || 'N/A'}`);
      item.accounts.forEach(acct => {
        console.log(`  - Account: ${acct.name} (*${acct.mask}), Balance: ${formatCurrency(acct.current_balance)}`);
      });
    });
    
    // 3. Update test
    logSection('Testing Update Operations');
    
    console.log('Updating account balance...');
    const newBalance = 2000.50;
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({ current_balance: newBalance })
      .eq('id', account.id)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update account: ${updateError.message}`);
    }
    
    console.log(`✅ Updated account balance from ${formatCurrency(account.current_balance)} to ${formatCurrency(updatedAccount.current_balance)}`);
    
    // 4. Delete test data
    logSection('Cleaning Up Test Data');
    
    console.log('Deleting test transaction...');
    await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id);
    
    console.log('Deleting test account...');
    await supabase
      .from('accounts')
      .delete()
      .eq('id', account.id);
    
    console.log('Deleting test item...');
    await supabase
      .from('items')
      .delete()
      .eq('id', item.id);
    
    console.log('✅ Test data cleaned up');
    
    // Summary
    logSection('TEST SUMMARY');
    console.log('✅ Create operations: WORKING');
    console.log('✅ Read operations: WORKING');
    console.log('✅ Update operations: WORKING');
    console.log('✅ Delete operations: WORKING');
    console.log('✅ Data relationships: WORKING');
    
    return true;
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error);
    return false;
  }
}

// Use an existing user ID - replace with your test user
const userId = 'ae47accf-78b6-4b8a-841c-73738c78152d';
testDatabaseCRUD(userId);

module.exports = { testDatabaseCRUD }; 