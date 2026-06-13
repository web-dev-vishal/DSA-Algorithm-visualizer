import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import config from '../config/index.js';

const testMongoUri = 'mongodb://127.0.0.1:27017/dsa_visualizer_test';

beforeAll(async () => {
  // Override MONGODB_URI for testing
  config.mongoUri = testMongoUri;
  config.configName = 'test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testMongoUri);
  }
});

afterAll(async () => {
  // Clean up database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  // Clear collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Authentication API Endpoints', () => {
  const testUser = {
    name: 'Test Tester',
    email: 'test@example.com',
    password: 'securePassword123'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      
      // Password should not be returned
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with empty inputs or invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: 'short'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should prevent duplicate email registrations', async () => {
      // Register first time
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Register second time
      const res = await request(app).post('/api/v1/auth/register').send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create user directly
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should log in user and set access/refresh tokens in cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      
      // Cookies assertions
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some(c => c.includes('refreshToken'))).toBe(true);
      expect(cookies.some(c => c.includes('accessToken'))).toBe(true);
    });

    it('should fail on incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Perform 5 failures
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: testUser.email, password: 'wrongpassword' });
      }

      // 6th attempt should block with lockout
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('locked');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should revoke session and clear cookies', async () => {
      // 1. Register & Login
      await request(app).post('/api/v1/auth/register').send(testUser);
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken } = loginRes.body.data;
      const cookies = loginRes.headers['set-cookie'];

      // 2. Logout with token
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', cookies)
        .send();

      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Refresh token cookie should be empty
      const clearCookies = logoutRes.headers['set-cookie'] || [];
      expect(clearCookies.some(c => c.includes('refreshToken=;'))).toBe(true);
    });
  });
});
