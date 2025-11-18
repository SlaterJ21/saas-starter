-- Insert a demo organization
INSERT INTO organizations (id, name, slug) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org');

-- Insert a demo project
INSERT INTO projects (id, organization_id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'First Project', 'A demo project to get started');

-- Insert demo tasks
INSERT INTO tasks (project_id, title, description, status) VALUES
    ('00000000-0000-0000-0000-000000000002', 'Set up database', 'Configure PostgreSQL with Docker', 'done'),
    ('00000000-0000-0000-0000-000000000002', 'Add GraphQL API', 'Set up PostGraphile', 'in_progress'),
    ('00000000-0000-0000-0000-000000000002', 'Build dashboard', 'Create the main UI', 'todo');
