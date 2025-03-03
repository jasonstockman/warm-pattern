# Error Handling Best Practices

This document provides guidelines for using the error handling utilities and implementing robust error handling throughout the application.

## Available Utility Functions

Our application includes several utility functions in `src/utils/errorHandling.ts` for safe error handling:

### `safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K] | null = null): T[K] | null`

Safely retrieves a property from an object, handling null/undefined values.

```typescript
// Example usage
import { safeGet } from '../utils/errorHandling';

// Without safeGet
const errorMessage = error?.response?.data?.message; // Could throw if any property is undefined

// With safeGet
const errorMessage = safeGet(error, 'message', 'Unknown error');
// Or for nested objects:
const responseMessage = safeGet(safeGet(error, 'response'), 'data')?.message || 'Unknown error';
```

### `getErrorMessage(error: unknown): string`

Converts any error object to a string message, handling different error types.

```typescript
import { getErrorMessage } from '../utils/errorHandling';

try {
  // Some code that might throw
} catch (error) {
  // Safely get a string representation regardless of error type
  console.error(getErrorMessage(error));
}
```

### `safeAsync<T>(promise: Promise<T>): Promise<[T | null, Error | null]>`

Handles async operations safely, returning a tuple of data and error.

```typescript
import { safeAsync } from '../utils/errorHandling';

async function fetchData() {
  const [data, error] = await safeAsync(api.getData());
  
  if (error) {
    // Handle error
    console.error('Failed to fetch data:', getErrorMessage(error));
    return null;
  }
  
  return data;
}
```

### `hasErrorCode(error: unknown, code: string): error is { code: string }`

Type guard to check if an error object has a specific code property.

```typescript
import { hasErrorCode } from '../utils/errorHandling';

if (hasErrorCode(error, 'UNAUTHORIZED')) {
  // Handle unauthorized error
  logout();
}
```

### `isDefined<T>(value: T | null | undefined): value is T`

Check if a value is defined (not null or undefined).

```typescript
import { isDefined } from '../utils/errorHandling';

if (isDefined(user)) {
  // TypeScript knows user is not null or undefined here
  console.log(user.name);
}
```

### `protectCall<T>(fn: () => T, fallback: T | (() => T)): T`

Protect a function call against errors, wrapping it in a try/catch block.

```typescript
import { protectCall } from '../utils/errorHandling';

// Will return [] if JSON.parse throws an error
const data = protectCall(() => JSON.parse(rawData), []);

// Can also use a fallback function
const config = protectCall(
  () => JSON.parse(localStorage.getItem('config') || '{}'),
  () => ({ theme: 'light', language: 'en' })
);
```

## Error Handling Best Practices

### 1. Always Use Type-Safe Error Handling

Use TypeScript's strict null checking and the utility functions to ensure type safety when handling errors:

```typescript
// ❌ INCORRECT - Might cause runtime errors
function processError(error) {
  if (error.code === 'NOT_FOUND') {
    return error.message;
  }
  return 'Unknown error';
}

// ✅ CORRECT - Type-safe approach
import { isDefined, safeGet } from '../utils/errorHandling';

function processError(error: unknown) {
  const errorCode = safeGet(error as any, 'code');
  if (isDefined(errorCode) && errorCode === 'NOT_FOUND') {
    return safeGet(error as any, 'message', 'Not found');
  }
  return 'Unknown error';
}
```

### 2. Handle Async Errors Consistently

Use `safeAsync` or consistent try/catch patterns:

```typescript
// ✅ RECOMMENDED - Using safeAsync
import { safeAsync, getErrorMessage } from '../utils/errorHandling';

async function fetchUserData(userId: string) {
  const [userData, error] = await safeAsync(api.getUserData(userId));
  
  if (error) {
    // Log the error
    console.error(`Failed to fetch user data: ${getErrorMessage(error)}`);
    
    // Return a sensible default or null
    return null;
  }
  
  return userData;
}
```

### 3. Centralize Error Handling Logic

For application-wide error handling, use a central service or context:

```typescript
// In your ErrorContext.tsx
import { createContext, useContext, useState } from 'react';
import { getErrorMessage } from '../utils/errorHandling';

const ErrorContext = createContext({
  setError: (error: unknown) => {},
  clearError: () => {},
  error: null as string | null,
});

export const ErrorProvider = ({ children }) => {
  const [error, setErrorMessage] = useState<string | null>(null);
  
  const setError = (error: unknown) => {
    setErrorMessage(getErrorMessage(error));
  };
  
  const clearError = () => {
    setErrorMessage(null);
  };
  
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
```

### 4. Use Error Boundaries for React Components

Implement React Error Boundaries to catch errors in component trees:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>Something went wrong. Please try again.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 5. Testing Error Handling

Write tests for error handling logic:

```typescript
// Example test for error handling in a component
it('shows error message when API call fails', async () => {
  // Mock API to throw an error
  jest.spyOn(api, 'getData').mockRejectedValue(new Error('API Error'));
  
  render(<YourComponent />);
  
  // Wait for error to be displayed
  expect(await screen.findByText('API Error')).toBeInTheDocument();
});

// Example test for utility functions
it('safeGet returns default value for undefined property', () => {
  const obj = { name: 'Test' };
  expect(safeGet(obj, 'age' as any, 0)).toBe(0);
});
```

## When to Use Which Utility

- Use `safeGet` when accessing properties that might be undefined, especially from API responses
- Use `getErrorMessage` when you need to display error messages to users
- Use `safeAsync` for API calls and other Promise-based operations
- Use `hasErrorCode` when handling specific error types based on error codes
- Use `isDefined` as a type guard to check for null/undefined values
- Use `protectCall` when calling functions that might throw errors (like JSON.parse)

## Additional Resources

- [TypeScript Handbook: Error Handling](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator)
- [React Error Boundaries Documentation](https://reactjs.org/docs/error-boundaries.html) 