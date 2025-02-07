// filepath: /social-network-server/social-network-server/tests/user.test.ts
import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { User } from '../src/models/User'; // Adjust the path as necessary

describe('User API', () => {
  beforeAll(async () => {
    // Setup database connection and any necessary seed data
  });

  afterAll(async () => {
    // Cleanup database connection
  });

  it('should fetch a user profile', async () => {
    const response = await request(app).get('/api/users/1'); // Adjust the endpoint as necessary
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  it('should update user information', async () => {
    const response = await request(app)
      .put('/api/users/1') // Adjust the endpoint as necessary
      .send({ name: 'Updated Name' }); // Adjust the payload as necessary
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Updated Name');
  });

  it('should delete a user', async () => {
    const response = await request(app).delete('/api/users/1'); // Adjust the endpoint as necessary
    expect(response.status).toBe(204);
  });
});