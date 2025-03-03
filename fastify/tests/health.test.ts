/**
 * Simple test for health endpoint
 */
import fastify from 'fastify';

describe('Health Endpoint', () => {
  const app = fastify();

  beforeAll(() => {
    // Add a simple health route
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return a 200 OK status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toHaveProperty('status', 'ok');
    expect(JSON.parse(response.payload)).toHaveProperty('timestamp');
  });
}); 