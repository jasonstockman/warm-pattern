/**
 * Main test runner for all database and API tests
 */
const { testDatabaseSchema } = require('./db/schema.test');
const { testDatabaseCRUD } = require('./db/crud.test');
const { testAuthentication } = require('./api/auth.test');
const { testTransactionWorkflows } = require('./integration/flows.test');
const { logSection } = require('./utils/test-helpers');

async function runAllTests() {
  logSection('RUNNING ALL TESTS');
  
  const results = {
    schema: false,
    crud: false,
    auth: false,
    workflows: false
  };
  
  // Test database schema
  logSection('Testing Database Schema');
  try {
    const schemaResult = await testDatabaseSchema();
    results.schema = schemaResult.success;
    
    // Even if schema test technically fails, we'll continue with other tests
    // since operations are working
  } catch (error) {
    console.error('Schema test error:', error);
  }
  
  // Always run CRUD tests, even if schema tests "fail"
  logSection('Testing Database CRUD Operations');
  try {
    const userId = 'ae47accf-78b6-4b8a-841c-73738c78152d'; // Your test user ID
    results.crud = await testDatabaseCRUD(userId);
  } catch (error) {
    console.error('CRUD test error:', error);
  }
  
  // Test authentication
  logSection('Testing Authentication');
  try {
    results.auth = await testAuthentication();
  } catch (error) {
    console.error('Auth test error:', error);
  }
  
  // Test integration workflows
  logSection('Testing Integration Workflows');
  try {
    results.workflows = await testTransactionWorkflows();
  } catch (error) {
    console.error('Workflow test error:', error);
  }
  
  // Print summary
  logSection('TEST SUMMARY');
  console.log(`Schema Tests: ${results.schema ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`CRUD Tests: ${results.crud ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Auth Tests: ${results.auth ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Workflow Tests: ${results.workflows ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallSuccess = Object.values(results).every(result => result === true);
  console.log(`\nOverall Test Result: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  return overallSuccess;
}

runAllTests(); 