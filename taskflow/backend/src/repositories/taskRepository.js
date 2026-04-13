const pool = require('../config/db');

const taskRepository = {

  // Find all tasks for a project with optional filters
  // Used by: GET /projects/:id/tasks
  async findAllByProject(projectId, filters = {}) {
    let query = `
      SELECT id, title, description, status, priority, 
             project_id, assignee_id, created_by,
             due_date, created_at, updated_at
      FROM tasks 
      WHERE project_id = \$1
    `;
    const values = [projectId];
    let paramCount = 2;

    // Filter by status if provided
    if (filters.status) {
      query += ` AND status = 
$$
{paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Filter by assignee if provided
    if (filters.assignee) {
      query += ` AND assignee_id =
$$
{paramCount}`;
      values.push(filters.assignee);
      paramCount++;
    }

    // Pagination
    if (filters.limit) {
      query += ` ORDER BY created_at DESC LIMIT 
$$
{paramCount}`;
      values.push(filters.limit);
      paramCount++;

      if (filters.offset) {
        query += ` OFFSET
$$
{paramCount}`;
        values.push(filters.offset);
        paramCount++;
      }
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Count total tasks for a project (for pagination)
  // Used by: GET /projects/:id/tasks (to return total count)
  async countByProject(projectId, filters = {}) {
    let query = `SELECT COUNT(*) FROM tasks WHERE project_id = \$1`;
    const values = [projectId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = 
$$
{paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.assignee) {
      query += ` AND assignee_id =
$$
{paramCount}`;
      values.push(filters.assignee);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  },

  // Find a single task by ID
  // Used by: PATCH /tasks/:id, DELETE /tasks/:id
  async findById(id) {
    const result = await pool.query(
      `SELECT id, title, description, status, priority,
              project_id, assignee_id, created_by,
              due_date, created_at, updated_at
       FROM tasks 
       WHERE id = \$1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new task
  // Used by: POST /projects/:id/tasks
  async create(taskData) {
    const result = await pool.query(
      `INSERT INTO tasks 
         (title, description, status, priority, project_id, 
          assignee_id, created_by, due_date) 
       VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8) 
       RETURNING id, title, description, status, priority,
                 project_id, assignee_id, created_by,
                 due_date, created_at, updated_at`,
      [
        taskData.title,
        taskData.description,
        taskData.status || 'todo',
        taskData.priority,
        taskData.projectId,
        taskData.assigneeId,
        taskData.createdBy,
        taskData.dueDate,
      ]
    );
    return result.rows[0];
  },

  // Update a task (dynamic fields)
  // Used by: PATCH /tasks/:id
  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = {
      title: 'title',
      description: 'description',
      status: 'status',
      priority: 'priority',
      assignee_id: 'assignee_id',
      due_date: 'due_date',
    };

    for (const [key, column] of Object.entries(allowedFields)) {
      if (fields[key] !== undefined) {
        setClauses.push(`${column} = 
$$
{paramCount}`);
        values.push(fields[key]);
        paramCount++;
      }
    }

    // If nothing to update, return current task
    if (setClauses.length === 0) {
      return this.findById(id);
    }

    // Always update updated_at
    setClauses.push(`updated_at = NOW()`);

    values.push(id);

    const result = await pool.query(
      `UPDATE tasks 
       SET ${setClauses.join(', ')} 
       WHERE id =
$$
{paramCount} 
       RETURNING id, title, description, status, priority,
                 project_id, assignee_id, created_by,
                 due_date, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete a task
  // Used by: DELETE /tasks/:id
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = \$1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  },
};

module.exports = taskRepository;