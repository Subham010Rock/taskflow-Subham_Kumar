
INSERT INTO users (id, name, email, password)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Test User',
    'test@example.com',
    '$2b$12$LJ3m4ys8bOYylqTqMhme5O0GRMGannMBKQvz8iFLqJFr8MwIm3uGK'
);

INSERT INTO projects (id, name, description, owner_id)
VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    'Sample Project',
    'A sample project for testing',
    '550e8400-e29b-41d4-a716-446655440000'
);

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, created_by, due_date)
VALUES 
(
    '770e8400-e29b-41d4-a716-446655440001',
    'Design homepage',
    'Create wireframes and mockups for the homepage',
    'todo',
    'high',
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '2025-04-15'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    'Set up database',
    'Configure PostgreSQL and write migrations',
    'in_progress',
    'medium',
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '2025-04-10'
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    'Write API documentation',
    'Document all endpoints in the README',
    'done',
    'low',
    '660e8400-e29b-41d4-a716-446655440000',
    NULL,
    '550e8400-e29b-41d4-a716-446655440000',
    NULL
);
