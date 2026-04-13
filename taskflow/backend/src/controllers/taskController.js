const taskService = require('../services/taskService');
const taskValidator = require('../validators/taskValidator');

const taskController = {

  // GET /projects/:id/tasks
  async list(req, res, next) {
    try {
      // Validate query filters
      const filters = taskValidator.validateFilters(req.query);

      const result = await taskService.listTasks(
        req.params.id,
        req.user.id,
        filters
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // POST /projects/:id/tasks
  async create(req, res, next) {
    try {
      const taskData = taskValidator.validateCreate(req.body);

      const task = await taskService.createTask(
        req.params.id,
        taskData,
        req.user.id
      );

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /tasks/:id
  async update(req, res, next) {
    try {
      const fields = taskValidator.validateUpdate(req.body);

      const task = await taskService.updateTask(
        req.params.id,
        fields,
        req.user.id
      );

      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /tasks/:id
  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;