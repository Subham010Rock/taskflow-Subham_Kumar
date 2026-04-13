-- migrate:up

-- Speed up: "List projects the current user owns"
-- Used by: GET /projects (WHERE owner_id = ?)
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Speed up: "List all tasks in a project"
-- Used by: GET /projects/:id/tasks (WHERE project_id = ?)
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Speed up: "List tasks assigned to me"
-- Used by: GET /projects/:id/tasks?assignee=uuid
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);

-- Speed up: "List tasks in project filtered by status"
-- Used by: GET /projects/:id/tasks?status=todo
-- Composite index: covers project_id + status together
CREATE INDEX idx_tasks_project_id_status ON tasks(project_id, status);

-- Speed up: "Find who created this task" (for delete permission)
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- migrate:down

DROP INDEX idx_tasks_created_by;
DROP INDEX idx_tasks_project_id_status;
DROP INDEX idx_tasks_assignee_id;
DROP INDEX idx_tasks_project_id;
DROP INDEX idx_projects_owner_id;