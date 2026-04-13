const request = require('supertest');
const app = require('../src/index');
const { setupDatabase, teardownDatabase } = require('./setup');

// Before all tests in this file
beforeAll(async () => {
  await setupDatabase();
});

// After all tests in this file
afterAll(async () => {
  await teardownDatabase();
});

describe('Auth Endpoints', () => {

  // ==========================================
  // TEST 1: Register successfully
  // ==========================================
  describe('POST /auth/register', () => {
    
    it('should register a new user and return token', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Alice Test',
          email: 'alice@test.com',
          password: 'password123',
        });

      // Check status code
      expect(res.status).toBe(201);

      // Check response structure
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.name).toBe('Alice Test');
      expect(res.body.user.email).toBe('alice@test.com');

      // Password should NEVER be in response
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 409 if email already exists', async () => {
      // Register same email again
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Alice Again',
          email: 'alice@test.com',
          password: 'password456',
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'bob@test.com',
          // missing name and password!
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('validation failed');
      expect(res.body.fields).toHaveProperty('name');
      expect(res.body.fields).toHaveProperty('password');
    });
  });

  // ==========================================
  // TEST 2: Login successfully
  // ==========================================
  describe('POST /auth/login', () => {
    
    it('should login with valid credentials and return token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('alice@test.com');

      // Password should NEVER be in response
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nobody@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      // Same error message for wrong email AND wrong password!
      expect(res.body.error).toBe('invalid credentials');
    });
  });

  // ==========================================
  // TEST 3: Protected routes
  // ==========================================
  describe('Protected Routes', () => {
    
    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .get('/projects');
      
      // No Authorization header → 401
      expect(res.status).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
      // First, login to get a token
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'alice@test.com',
          password: 'password123',
        });

      const token = loginRes.body.token;

      // Use the token to access protected route
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('projects');
    });
  });
});