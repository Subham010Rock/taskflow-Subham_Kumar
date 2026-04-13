const pool = require('../config/db');

const projectRepository = {

  // Find all projects a user owns OR has tasks assigned in
  // Used by: GET /projects
  async findAllByUser(userId) {
    const result = await pool.query(
      `SELECT DISTINCT p.id, p.name, p.description, 
              p.owner_id, p.created_at
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.owner_id = \$1 
          OR t.assignee_id = \$1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Find a single project by ID
  // Used by: GET /projects/:id, PATCH, DELETE
  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, description, owner_id, created_at 
       FROM projects 
       WHERE id = \$1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new project
  // Used by: POST /projects
  async create(name, description, ownerId) {
    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id) 
       VALUES (\$1, \$2, \$3) 
       RETURNING id, name, description, owner_id, created_at`,
      [name, description, ownerId]
    );
    return result.rows[0];
  },

  // Update a project's name and/or description
  // Used by: PATCH /projects/:id
  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (fields.name !== undefined) {
      setClauses.push(`name = 
$$
{paramCount}`);
      values.push(fields.name);
      paramCount++;
    }

    if (fields.description !== undefined) {
      setClauses.push(`description =
$$
{paramCount}`);
      values.push(fields.description);
      paramCount++;
    }

    // If nothing to update, return current project
    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE projects 
       SET ${setClauses.join(', ')} 
       WHERE id = 
$$
{paramCount} 
       RETURNING id, name, description, owner_id, created_at`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete a project (tasks are CASCADE deleted)
  // Used by: DELETE /projects/:id
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  },

    // Find a project by ID with all its tasks
  // Used by: GET /projects/:id
  async findByIdWithTasks(id) {
    // Query 1: Get the project
    const projectResult = await pool.query(
      `SELECT id, name, description, owner_id, created_at 
       FROM projects 
       WHERE id = \$1`,
      [id]
    );
    
    const project = projectResult.rows[0];
    if (!project) return null;

    // Query 2: Get all tasks for this project
    const tasksResult = await pool.query(
      `SELECT id, title, description, status, priority, 
              project_id, assignee_id, created_by, 
              due_date, created_at, updated_at
       FROM tasks 
       WHERE project_id = \$1
       ORDER BY created_at DESC`,
      [id]
    );

    project.tasks = tasksResult.rows;
    return project;
  },
};

module.exports = projectRepository;