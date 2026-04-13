
const request = require('supertest');
const app = require('../src/index');
const { setupDatabase, teardownDatabase } = require('./setup');

let authToken;
let userId;

beforeAll(async () => {
  await setupDatabase();

  // Register a user and get token for authenticated requests
  const res = await request(app)
    .post('/auth/register')
    .send({
      name: 'Project Tester',
      email: 'project-tester@test.com',
      password: 'password123',
    });

  authToken = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Projects Endpoints', () => {

  let projectId;

  // ==========================================
  // CREATE PROJECT
  // ==========================================
  describe('POST /projects', () => {
    
    it('should create a project', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          description: 'A test project',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Project');
      expect(res.body.description).toBe('A test project');
      expect(res.body.owner_id).toBe(userId);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');

      // Save for later tests
      projectId = res.body.id;
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'No name provided',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('validation failed');
      expect(res.body.fields.name).toBe('is required');
    });
  });

  // ==========================================
  // LIST PROJECTS
  // ==========================================
  describe('GET /projects', () => {
    
    it('should list projects owned by user', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('projects');
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // GET SINGLE PROJECT
  // ==========================================
  describe('GET /projects/:id', () => {
    
    it('should return project details', async () => {
      const res = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(projectId);
      expect(res.body.name).toBe('Test Project');
      expect(res.body).toHaveProperty('tasks');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // UPDATE PROJECT
  // ==========================================
  describe('PATCH /projects/:id', () => {
    
    it('should update project name', async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Project Name');
      // Description should remain unchanged
      expect(res.body.description).toBe('A test project');
    });
  });

  // ==========================================
  // DELETE PROJECT
  // ==========================================
  describe('DELETE /projects/:id', () => {
    
    it('should delete project', async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify it's actually deleted
      const getRes = await request(app)
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});