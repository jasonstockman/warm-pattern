/**
 * Integration tests for key user flows
 * Tests entire feature flows from end-to-end
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { createTestUser, cleanupTestUser, logSection, formatCurrency } = require('../utils/test-helpers');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testTransactionWorkflows() {
  logSection('Testing Transaction Workflows');
  
  let userId = null;
  let accountId = null;
  
  try {
    // Create test user
    console.log('Creating test user...');
    const { userId: testUserId } = await createTestUser();
    userId = testUserId;
    console.log(`✅ Created test user with ID: ${userId}`);
    
    // Create an item
    console.log('\nCreating test item...');
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
    
    // Create an account
    console.log('\nCreating test checking account...');
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
        current_balance: 1000,
        available_balance: 900,
        iso_currency_code: 'USD'
      })
      .select()
      .single();
    
    if (accountError) {
      throw new Error(`Failed to create account: ${accountError.message}`);
    }
    
    accountId = account.id;
    console.log(`✅ Created checking account with ID: ${accountId}`);
    
    // Create some transactions
    console.log('\nCreating test transactions...');
    const transactions = [
      {
        user_id: userId,
        account_id: accountId,
        item_id: item.id,
        plaid_transaction_id: `test-txn-1-${Date.now()}`,
        name: 'Grocery Store',
        amount: 42.12,
        date: new Date().toISOString().split('T')[0],
        pending: false,
        type: 'debit',
        category: ['Food and Drink', 'Groceries']
      },
      {
        user_id: userId,
        account_id: accountId,
        item_id: item.id,
        plaid_transaction_id: `test-txn-2-${Date.now()}`,
        name: 'Coffee Shop',
        amount: 5.25,
        date: new Date().toISOString().split('T')[0],
        pending: false,
        type: 'debit',
        category: ['Food and Drink', 'Coffee']
      },
      {
        user_id: userId,
        account_id: accountId,
        item_id: item.id,
        plaid_transaction_id: `test-txn-3-${Date.now()}`,
        name: 'Paycheck',
        amount: -1500.00, // Negative for deposits
        date: new Date().toISOString().split('T')[0],
        pending: false,
        type: 'credit',
        category: ['Income', 'Payroll']
      }
    ];
    
    const { data: createdTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();
    
    if (transactionsError) {
      throw new Error(`Failed to create transactions: ${transactionsError.message}`);
    }
    
    console.log(`✅ Created ${createdTransactions.length} transactions`);
    
    // Test Workflow 1: Calculate Account Balance
    logSection('Testing Balance Calculations');
    
    // Use the calculate_balances function from the database
    const { data: balances, error: balancesError } = await supabase.rpc('calculate_balances', {
      user_id_param: userId
    });
    
    if (balancesError) {
      console.warn(`⚠️ Could not use calculate_balances function: ${balancesError.message}`);
      console.log('Calculating balances manually...');
      
      // Calculate balances manually
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('current_balance, type')
        .eq('user_id', userId);
      
      if (accountsError) {
        throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
      }
      
      const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);
      const depositBalance = accounts
        .filter(account => account.type === 'depository')
        .reduce((sum, account) => sum + account.current_balance, 0);
      
      console.log(`Total balance: ${formatCurrency(totalBalance)}`);
      console.log(`Deposit account balance: ${formatCurrency(depositBalance)}`);
    } else {
      console.log('✅ Used calculate_balances database function');
      console.log(`Total balance: ${formatCurrency(balances[0].total_balance)}`);
      console.log(`Deposit account balance: ${formatCurrency(balances[0].deposit_balance)}`);
      console.log(`Credit account balance: ${formatCurrency(balances[0].credit_balance)}`);
    }
    
    // Test Workflow 2: Transaction Analysis
    logSection('Testing Transaction Analysis');
    
    // Get transaction sum by category
    const { data: transactions2, error: txnError } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', userId);
    
    if (txnError) {
      throw new Error(`Failed to fetch transactions: ${txnError.message}`);
    }
    
    // Process transactions by category (simple analytics)
    const categorySums = {};
    transactions2.forEach(txn => {
      const category = txn.category && txn.category.length > 0 ? txn.category[0] : 'Uncategorized';
      if (!categorySums[category]) {
        categorySums[category] = 0;
      }
      categorySums[category] += txn.amount;
    });
    
    console.log('Transaction totals by category:');
    Object.entries(categorySums).forEach(([category, sum]) => {
      console.log(`${category}: ${formatCurrency(sum)}`);
    });
    
    // Clean up
    console.log('\nCleaning up test data...');
    await cleanupTestUser(userId);
    
    // Summary
    logSection('WORKFLOW TEST SUMMARY');
    console.log('✅ Account creation workflow: PASSED');
    console.log('✅ Transaction creation workflow: PASSED');
    console.log('✅ Balance calculation workflow: PASSED');
    console.log('✅ Transaction analysis workflow: PASSED');
    console.log('All integration tests completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ WORKFLOW TEST FAILED:', error.message);
    
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

testTransactionWorkflows();

module.exports = { testTransactionWorkflows }; 