/**
 * Global Jest setup file that runs before all tests
 */

// Load environment variables for testing
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default async (): Promise<void> => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // You can add global setup logic here, such as:
  // - Database setup/cleanup
  // - Mocking external services
  // - Seeding test data
  
  console.log('Jest global setup complete');
}; 