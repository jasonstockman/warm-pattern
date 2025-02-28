const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Read the SQL schema file
const schemaFilePath = path.resolve(__dirname, '../../../database/init/create.sql');
let schemaSQL;

try {
  schemaSQL = fs.readFileSync(schemaFilePath, 'utf8');
  console.log('Successfully loaded schema file');
} catch (err) {
  console.error('Error reading schema file:', err);
  console.log('Using hardcoded schema instead');
  
  // Fallback to hardcoded basic schema
  schemaSQL = `
-- Create schema for plaid pattern app
-- Schema for Supabase

-- Create profiles table that's managed by Supabase auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create item table to store Plaid items
CREATE TABLE IF NOT EXISTS public.items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plaid_item_id TEXT NOT NULL UNIQUE,
  plaid_access_token TEXT NOT NULL,
  plaid_institution_id TEXT,
  status TEXT DEFAULT 'good',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create accounts table to store Plaid accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plaid_account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mask TEXT,
  type TEXT NOT NULL,
  subtype TEXT,
  current_balance NUMERIC(28, 10),
  available_balance NUMERIC(28, 10),
  iso_currency_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table to store Plaid transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT NOT NULL UNIQUE,
  name TEXT,
  amount NUMERIC(28, 10) NOT NULL,
  date DATE NOT NULL,
  pending BOOLEAN NOT NULL,
  type TEXT,
  category TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create assets table to store non-Plaid assets
CREATE TABLE IF NOT EXISTS public.assets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC(28, 10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create profile trigger to create profile automatically when a user is created
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Create RLS policies
-- Profiles: Users can only access their own profiles
CREATE POLICY "Users can only access their own profiles"
  ON public.profiles
  FOR ALL
  USING (id = auth.uid());

-- Items: Users can only access their own items
CREATE POLICY "Users can only access their own items"
  ON public.items
  FOR ALL
  USING (user_id = auth.uid());

-- Accounts: Users can only access their own accounts
CREATE POLICY "Users can only access their own accounts"
  ON public.accounts
  FOR ALL
  USING (user_id = auth.uid());

-- Transactions: Users can only access their own transactions
CREATE POLICY "Users can only access their own transactions"
  ON public.transactions
  FOR ALL
  USING (user_id = auth.uid());

-- Assets: Users can only access their own assets
CREATE POLICY "Users can only access their own assets"
  ON public.assets
  FOR ALL
  USING (user_id = auth.uid());

-- Function to calculate balances
CREATE OR REPLACE FUNCTION calculate_balances(user_id_param UUID)
RETURNS TABLE (
  total_balance NUMERIC,
  deposit_balance NUMERIC,
  credit_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(current_balance), 0) as total_balance,
    COALESCE(SUM(CASE WHEN type = 'depository' THEN current_balance ELSE 0 END), 0) as deposit_balance,
    COALESCE(SUM(CASE WHEN type = 'credit' THEN current_balance ELSE 0 END), 0) as credit_balance
  FROM
    accounts
  WHERE
    user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
}

async function createSchema() {
  try {
    console.log('Creating database schema...');
    
    // Execute the SQL schema
    const { error } = await supabase.rpc('pg_execute', { sql: schemaSQL });
    
    if (error) {
      // If the RPC method fails, try another approach
      console.error('Error using rpc method:', error.message);
      console.log('Trying alternative approach with REST API...');
      
      // Split the schema into individual statements
      const statements = schemaSQL.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(`Executing ${statements.length} SQL statements individually...`);
      
      // Use Supabase SQL HTTP API to execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`Executing statement ${i+1}/${statements.length}`);
        
        // Execute the SQL
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_KEY
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error executing statement ${i+1}:`, errorText);
          // Continue anyway to try other statements
        }
      }
    }
    
    console.log('Schema creation completed');
    
    // Verify the tables were created
    await verifyTables();
    
  } catch (error) {
    console.error('Failed to create schema:', error);
  }
}

async function verifyTables() {
  console.log('\nVerifying tables...');
  const tables = ['profiles', 'items', 'accounts', 'transactions', 'assets'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Table '${table}' verification failed:`, error.message);
      } else {
        console.log(`✅ Table '${table}' created successfully`);
      }
    } catch (err) {
      console.error(`❌ Error checking table '${table}':`, err);
    }
  }
}

createSchema(); 