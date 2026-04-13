const projectRepository = require('../repositories/projectRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const projectService = {

  // List all accessible projects for a user
  async listProjects(userId) {
    return projectRepository.findAllByUser(userId);
  },

  // Get a single project with access check
  async getProject(projectId, userId) {
    const project = await projectRepository.findByIdWithTasks(projectId);
    
    if (!project) {
      throw new NotFoundError('project not found');
    }

    return project;
  },

  // Create a new project
  async createProject(name, description, ownerId) {
    return projectRepository.create(name, description, ownerId);
  },

  // Update a project (owner only)
  async updateProject(projectId, fields, userId) {
    // Step 1: Find the project
    const project = await projectRepository.findById(projectId);
    
    if (!project) {
      throw new NotFoundError('project not found');
    }

    // Step 2: Check ownership
    if (project.owner_id !== userId) {
      throw new ForbiddenError('only the project owner can update this project');
    }

    // Step 3: Update
    return projectRepository.update(projectId, fields);
  },

  // Delete a project (owner only)
  async deleteProject(projectId, userId) {
    // Step 1: Find the project
    const project = await projectRepository.findById(projectId);
    
    if (!project) {
      throw new NotFoundError('project not found');
    }

    // Step 2: Check ownership
    if (project.owner_id !== userId) {
      throw new ForbiddenError('only the project owner can delete this project');
    }

    // Step 3: Delete (CASCADE deletes tasks too)
    await projectRepository.delete(projectId);
  },
};

module.exports = projectService;