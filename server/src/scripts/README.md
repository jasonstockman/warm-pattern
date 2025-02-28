# Supabase Database Scripts

This directory contains scripts for managing and testing the Supabase database.

## Main Scripts

- **test-existing-user.js**: Comprehensive test script for validating the database functionality. Uses an existing user to test CRUD operations, relationships, and RLS policies.
  ```
  node src/scripts/test-existing-user.js
  ```

- **create-schema.js**: Creates the complete database schema in Supabase, including tables, relationships, and RLS policies.
  ```
  node src/scripts/create-schema.js
  ```

## Utility Scripts

- **find-users-without-profiles.js**: Identifies users in the auth system that are missing profiles.
  ```
  node src/scripts/find-users-without-profiles.js
  ```

- **create-missing-profile.js**: Creates a profile for a user that exists in the auth system but is missing a profile.
  ```
  node src/scripts/create-missing-profile.js
  ```

## Usage Examples

### Setting up the database 