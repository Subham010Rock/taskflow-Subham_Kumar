const projectService = require('../services/projectService');
const projectValidator = require('../validators/projectValidator');

const projectController = {

  // GET /projects
  async list(req, res, next) {
    try {
      const projects = await projectService.listProjects(req.user.id);
      res.json({ projects });
    } catch (error) {
      next(error);
    }
  },

  // POST /projects
  async create(req, res, next) {
    try {
      const { name, description } = projectValidator.validateCreate(req.body);
      const project = await projectService.createProject(
        name, 
        description, 
        req.user.id
      );
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  },

  // GET /projects/:id
  async getById(req, res, next) {
    try {
      const project = await projectService.getProject(
        req.params.id, 
        req.user.id
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /projects/:id
  async update(req, res, next) {
    try {
      const fields = projectValidator.validateUpdate(req.body);
      const project = await projectService.updateProject(
        req.params.id, 
        fields, 
        req.user.id
      );
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /projects/:id
  async delete(req, res, next) {
    try {
      await projectService.deleteProject(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = projectController;