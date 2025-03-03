/**
 * Context factory module that provides a standardized way to create React contexts
 * with built-in TypeScript support, error handling, and loading states.
 */
import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Base state interface that all context states should extend
 */
export interface BaseContextState {
  /** Whether data is currently loading */
  loading?: boolean;
  /** Error message if an error occurred */
  error?: string | null;
}

/**
 * Configuration for creating a context
 */
export interface CreateContextConfig<State, Actions> {
  /** Display name for the context (used in React DevTools) */
  displayName: string;
  /** Initial state values */
  initialState: State;
  /** Optional initial actions (empty functions) */
  initialActions?: Partial<Actions>;
}

/**
 * Result of creating a context using the factory
 */
export interface ContextFactoryResult<State, Actions> {
  /** The React context object */
  Context: React.Context<State & Actions>;
  /** Provider component for the context */
  Provider: React.FC<{ children: ReactNode; value?: Partial<State & Actions> }>;
  /** Custom hook for consuming the context */
  useContext: () => State & Actions;
}

/**
 * Creates a context with standardized pattern
 * 
 * @param config - Configuration for the context
 * @returns The context, provider component, and custom hook
 */
export function createContextFactory<State extends BaseContextState, Actions>(
  config: CreateContextConfig<State, Actions>
): ContextFactoryResult<State, Actions> {
  const { displayName, initialState, initialActions = {} as Partial<Actions> } = config;

  // Create the context with initial values
  const Context = createContext<State & Actions>({
    ...initialState,
    ...initialActions as any,
  });

  // Set display name for dev tools
  Context.displayName = displayName;

  // Create the provider component
  const Provider: React.FC<{
    children: ReactNode;
    value?: Partial<State & Actions>;
  }> = ({ children, value = {} }) => {
    // Merge the initial values with any provided values
    const contextValue = {
      ...initialState,
      ...initialActions as any,
      ...value,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  // Create a custom hook for using this context
  const useContextHook = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    return context;
  };

  return {
    Context,
    Provider,
    useContext: useContextHook,
  };
}

/**
 * Type helper for extracting the state type from a context factory result
 */
export type ExtractContextState<T> = T extends ContextFactoryResult<infer S, any> ? S : never;

/**
 * Type helper for extracting the actions type from a context factory result
 */
export type ExtractContextActions<T> = T extends ContextFactoryResult<any, infer A> ? A : never; 