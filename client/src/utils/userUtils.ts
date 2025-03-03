/**
 * Utility functions for user data
 */

import { createId } from '../types/branded';
import type { User } from '@supabase/supabase-js';
import type { UserId } from '../types';

/**
 * Converts a Supabase user to a numeric user ID compatible with our system
 * @param user The Supabase user object
 * @returns A UserId or undefined if no user
 */
export function getNumericUserId(user: User | null): UserId | undefined {
  if (!user) return undefined;
  
  // Supabase IDs are UUIDs, we need to create a numeric ID for our system
  // For compatibility, hash the UUID to a number or use a numeric property if available
  // This ensures consistency across the application
  return createId.user(parseInt(user.id.replace(/-/g, '').substring(0, 8), 16) % 1000000);
}

/**
 * Gets the display name for a user from either Supabase or custom User type
 * @param user The user object (could be Supabase User or our custom User type)
 * @returns A string display name
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'User';
  
  // Handle both our custom User type and Supabase User type
  if (typeof user === 'object') {
    // Check for our custom User properties
    if ('username' in user && user.username) {
      return user.username;
    }
    
    // Check for Supabase User properties
    if ('email' in user && user.email) {
      return user.email;
    }
    
    // Check for user_metadata
    if ('user_metadata' in user && 
        user.user_metadata && 
        'name' in user.user_metadata) {
      return user.user_metadata.name;
    }
  }
  
  return 'User';
} 