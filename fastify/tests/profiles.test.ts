/**
 * Tests for profile routes
 */
import { FastifyInstance } from 'fastify';
import { buildTestApp } from './testApp';
import { mockSupabaseClient, resetMocks as resetSupabaseMocks } from './mocks/supabase';
import { mockRequireAuth, resetMocks as resetAuthMocks } from './mocks/auth';
import { mockCreate, mockUpdate, mockGetById, mockGetByUserId, mockGetAll, mockDelete, resetMocks as resetProfileMocks } from './mocks/profile';
import { mockSupabaseResponse } from './helpers';
import { Profile } from '../types/profile';

describe('Profile Routes', () => {
  let app: FastifyInstance;
  const testToken = 'test.jwt.token';
  
  // Sample profile data for testing
  const mockProfile: Profile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174002',
    first_name: 'John',
    last_name: 'Doe',
    phone: '1234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(async () => {
    // Build the app once for all tests in this file
    app = await buildTestApp();
    // Mock the JWT verify function
    app.jwt.verify = jest.fn().mockReturnValue({
      sub: mockProfile.user_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
    resetAuthMocks();
    resetProfileMocks();
    
    // Default behavior for requireAuth is to pass through
    mockRequireAuth.mockImplementation(async (request, reply) => {
      request.user = {
        id: mockProfile.user_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    });

    // Default behavior for profile service mocks
    mockGetAll.mockResolvedValue([mockProfile]);
    mockGetById.mockResolvedValue(mockProfile);
    mockGetByUserId.mockResolvedValue(mockProfile);
    mockCreate.mockResolvedValue(mockProfile);
    mockUpdate.mockResolvedValue({ ...mockProfile, name: 'Updated John Doe' });
    mockDelete.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    // Close the app after all tests
    await app.close();
  });

  describe('GET /profiles/:id', () => {
    it('should return a profile when authenticated and profile exists', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/profiles/${mockProfile.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      // Assertions
      expect(response.statusCode).toBe(200);
      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockGetById).toHaveBeenCalledWith(mockProfile.id);
      expect(JSON.parse(response.payload)).toEqual(mockProfile);
    });

    it('should return 404 when profile does not exist', async () => {
      mockGetById.mockRejectedValue(new Error('Profile not found'));

      const response = await app.inject({
        method: 'GET',
        url: '/profiles/nonexistent',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      // Assertions
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      mockRequireAuth.mockImplementation(async (request, reply) => {
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
      });

      const response = await app.inject({
        method: 'GET',
        url: `/profiles/${mockProfile.id}`,
      });

      // Assertions
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /profiles', () => {
    it('should create a new profile', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/profiles',
        headers: {
          authorization: `Bearer ${testToken}`,
          'content-type': 'application/json',
        },
        payload: {
          first_name: mockProfile.first_name,
          last_name: mockProfile.last_name,
          phone: mockProfile.phone,
        },
      });

      // Assertions
      expect(response.statusCode).toBe(201);
      expect(mockCreate).toHaveBeenCalled();
      expect(JSON.parse(response.payload)).toEqual(mockProfile);
    });
  });
}); 