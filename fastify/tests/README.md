# Testing Guide for Fastify API

This directory contains the testing infrastructure for the Fastify API server.

## Setup

The testing environment is configured with:

- **Jest**: Testing framework
- **ts-jest**: TypeScript support for Jest
- **supertest**: HTTP assertions for API testing
- **Mock implementations**: For Supabase, Auth, and other external dependencies

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## Test Structure

- **tests/helpers.ts**: Common testing utilities
- **tests/mocks/**: Mock implementations of external dependencies
- **tests/testApp.ts**: Custom app builder for testing
- **tests/setup.ts**: Global setup for Jest
- **tests/*.test.ts**: Individual test files for different components

## Writing Tests

### API Route Tests

API route tests use Fastify's `inject` method to make requests without a real HTTP server:

```typescript
// Example test for an API endpoint
describe('GET /resource', () => {
  it('should return 200 when resource exists', async () => {
    // Setup mocks
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockData)),
    } as any);
    
    // Make request
    const response = await app.inject({
      method: 'GET',
      url: '/resource/123',
      headers: { Authorization: `Bearer ${testToken}` },
    });
    
    // Assertions
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual(mockData);
  });
});
```

### Unit Tests for Services

```typescript
// Example unit test for a service
describe('ResourceService', () => {
  it('should create a resource', async () => {
    // Setup mocks
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockResource)),
    } as any);
    
    // Call service method
    const result = await resourceService.create(mockResourceInput);
    
    // Assertions
    expect(result).toEqual(mockResource);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('resources');
  });
});
```

## Mocking External Dependencies

The testing framework uses Jest's mocking capabilities to replace external dependencies:

- **Supabase**: Mocked in `tests/mocks/supabase.ts`
- **Authentication**: Mocked in `tests/mocks/auth.ts`

To reset mocks between tests, use:

```typescript
beforeEach(() => {
  resetSupabaseMocks();
  resetAuthMocks();
});
```

## Best Practices

1. **Use the test app builder**: Always use `buildTestApp()` from `testApp.ts` to ensure consistent test environment
2. **Reset mocks between tests**: Use the `resetMocks()` functions to ensure test isolation
3. **Mock external services**: Never call real external services in tests
4. **Test edge cases**: Test both happy paths and error scenarios
5. **Use descriptive test names**: Clearly describe what each test is verifying 