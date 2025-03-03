/**
 * Base store creation utility for the application
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { persist, PersistOptions } from 'zustand/middleware';

/**
 * Options for creating a store
 */
export interface CreateStoreOptions {
  /** Name of the store for DevTools */
  name: string;
  /** Whether to enable dev tools for this store */
  devTools?: boolean;
  /** Whether to use Immer for this store */
  useImmer?: boolean;
  /** Persistence options */
  persistOptions?: PersistOptions<any, any>;
}

/**
 * Creates a Zustand store with standard middleware setup
 * 
 * @example
 * // Create a user store with immer and devtools
 * const useUserStore = createAppStore(
 *   (set) => ({
 *     users: [],
 *     addUser: (user) => set((state) => { state.users.push(user); })
 *   }),
 *   { name: 'userStore' }
 * );
 */
export const createAppStore = <T extends object>(
  initializer: (set: any, get: any, store: any) => T,
  options: CreateStoreOptions
) => {
  const { name, devTools = true, useImmer = true, persistOptions } = options;
  
  // Start with the initializer
  let storeCreator: any = initializer;
  
  // Add immer if enabled
  if (useImmer) {
    storeCreator = immer(storeCreator);
  }
  
  // Add persistence if enabled
  if (persistOptions) {
    storeCreator = persist(storeCreator, persistOptions);
  }
  
  // Add devtools if enabled
  if (devTools) {
    storeCreator = devtools(storeCreator, { name });
  }
  
  // Create and return the store
  return create(storeCreator);
};

/**
 * Type helper for extracting the state type from a store
 */
export type StoreState<T> = T extends ((...args: any[]) => infer U) ? U : never; 