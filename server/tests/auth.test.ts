Sure, here's the contents for the file: /social-network-server/social-network-server/tests/auth.test.ts

import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { User } from '../src/models/User'; // Adjust the path as necessary

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Setup code, e.g., connecting to the database
  });

  afterAll(async () => {
    // Cleanup code, e.g., closing the database connection
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should fail to login with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });
    expect(response.status).toBe(401);
  });
});