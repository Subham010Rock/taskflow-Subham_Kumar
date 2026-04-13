const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');
const userRepository = require('../repositories/userRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const taskService = {

  // List tasks for a project with filters
  async listTasks(projectId, userId, filters) {
    // Step 1: Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('project not found');
    }

    // Step 2: Calculate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Step 3: Get tasks
    const tasks = await taskRepository.findAllByProject(projectId, {
      status: filters.status,
      assignee: filters.assignee,
      limit,
      offset,
    });

    // Step 4: Get total count for pagination
    const total = await taskRepository.countByProject(projectId, {
      status: filters.status,
      assignee: filters.assignee,
    });

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Create a new task
  async createTask(projectId, taskData, userId) {
    // Step 1: Verify project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('project not found');
    }

    // Step 2: If assignee is provided, verify they exist
    if (taskData.assigneeId) {
      const assignee = await userRepository.findById(taskData.assigneeId);
      if (!assignee) {
        throw new NotFoundError('assignee not found');
      }
    }

    // Step 3: Create the task
    return taskRepository.create({
      ...taskData,
      projectId,
      createdBy: userId,
    });
  },

  // Update a task
  async updateTask(taskId, fields, userId) {
    // Step 1: Find the task
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('task not found');
    }

    // Step 2: If assignee is being changed, verify new assignee exists
    if (fields.assignee_id) {
      const assignee = await userRepository.findById(fields.assignee_id);
      if (!assignee) {
        throw new NotFoundError('assignee not found');
      }
    }

    // Step 3: Update the task
    return taskRepository.update(taskId, fields);
  },

  // Delete a task (project owner OR task creator only)
  async deleteTask(taskId, userId) {
    // Step 1: Find the task
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('task not found');
    }

    // Step 2: Find the project (to check ownership)
    const project = await projectRepository.findById(task.project_id);

    // Step 3: Authorization check
    const isProjectOwner = project.owner_id === userId;
    const isTaskCreator = task.created_by === userId;

    if (!isProjectOwner && !isTaskCreator) {
      throw new ForbiddenError(
        'only the project owner or task creator can delete this task'
      );
    }

    // Step 4: Delete
    await taskRepository.delete(taskId);
  },
};

module.exports = taskService;