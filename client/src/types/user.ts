/**
 * User-related type definitions
 */
import { UserId, ItemId, AccountId } from './branded';

/**
 * Base User interface representing a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: number;
  /** Username of the user */
  username: string;
  /** When the user was created */
  created_at: string;
  /** When the user was last updated */
  updated_at: string;
}

/**
 * Legacy user type for backward compatibility
 * @deprecated Use User instead
 */
export interface UserType extends User {}

/**
 * Represents a user with additional fields populated
 */
export interface UserWithDetails extends User {
  /** Items associated with this user */
  items?: ItemId[];
  /** Accounts associated with this user */
  accounts?: AccountId[];
}

/**
 * Represents the user state for authentication
 */
export interface UserAuthState {
  /** The authenticated user */
  user: User | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Optional loading state */
  loading?: boolean;
  /** Optional error state */
  error?: string | null;
}

/**
 * User identifier for route parameters
 */
export interface UserIdParam {
  /** User ID in route parameters */
  userId: string | number;
}

/**
 * Authentication credentials for signing in
 */
export interface SignInCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Authentication credentials for signing up
 */
export interface SignUpCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Authentication session response
 */
export interface AuthResponse {
  /** User information */
  user: {
    /** Unique identifier for the user */
    id: string;
    /** Email address of the user */
    email: string;
  };
  /** Session tokens */
  session: {
    /** JWT access token */
    access_token: string;
    /** JWT refresh token */
    refresh_token: string;
  };
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  /** Username for the new user */
  username: string;
}

/**
 * Request payload for user login
 */
export interface LoginUserRequest {
  /** Username for login */
  username: string;
} 