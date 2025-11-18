import {Pool} from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

console.log('Initializing database pool...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),

    async findUserByAuth0Id(auth0Id: string) {
        const result = await pool.query(
            'SELECT * FROM users WHERE auth0_id = $1',
            [auth0Id]
        );
        return result.rows[0] || null;
    },

    async createUser(auth0Id: string, email: string, name?: string, avatarUrl?: string) {
        const result = await pool.query(
            `INSERT INTO users (auth0_id, email, name, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [auth0Id, email, name, avatarUrl]
        );
        return result.rows[0];
    },

    async createOrganization(name: string, slug: string, createdBy: string) {
        const result = await pool.query(
            `INSERT INTO organizations (name, slug) 
       VALUES ($1, $2) 
       RETURNING *`,
            [name, slug]
        );
        return result.rows[0];
    },

    async addUserToOrganization(userId: string, organizationId: string, role: 'owner' | 'admin' | 'member' | 'viewer') {
        const result = await pool.query(
            `INSERT INTO organization_members (user_id, organization_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [userId, organizationId, role]
        );
        return result.rows[0];
    },

    async getUserOrganizations(userId: string) {
        const result = await pool.query(
            `SELECT o.*, om.role, om.joined_at 
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY om.joined_at ASC`,
            [userId]
        );
        return result.rows;
    },

    async findOrCreateUser(auth0User: any) {
        // Try to find existing user
        let user = await this.findUserByAuth0Id(auth0User.sub);

        if (!user) {
            // Create new user
            user = await this.createUser(
                auth0User.sub,
                auth0User.email,
                auth0User.name,
                auth0User.picture
            );
            console.log('✅ Created new user:', user.id, user.email);

            // Create personal organization for new user
            const personalOrgName = `${auth0User.name || 'My'}'s Workspace`;
            const slug = `${auth0User.email.split('@')[0]}-${user.id.split('-')[0]}`;

            const org = await this.createOrganization(personalOrgName, slug, user.id);
            console.log('✅ Created personal organization:', org.id, org.name);

            // Add user as owner
            await this.addUserToOrganization(user.id, org.id, 'owner');
            console.log('✅ Added user as owner of organization');
        }

        return user;
    },
    async getOrganizationById(orgId: string) {
        const result = await pool.query(
            'SELECT * FROM organizations WHERE id = $1',
            [orgId]
        );
        return result.rows[0] || null;
    },

    async getUserOrgMembership(userId: string, orgId: string) {
        const result = await pool.query(
            `SELECT om.*, o.name, o.slug 
     FROM organization_members om
     JOIN organizations o ON o.id = om.organization_id
     WHERE om.user_id = $1 AND om.organization_id = $2`,
            [userId, orgId]
        );
        return result.rows[0] || null;
    },
    async getProjectsByOrganization(organizationId: string) {
        const result = await pool.query(
            `SELECT p.*, 
      u.name as creator_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
     FROM projects p
     LEFT JOIN users u ON p.created_by = u.id
     WHERE p.organization_id = $1
     ORDER BY p.created_at DESC`,
            [organizationId]
        );
        return result.rows;
    },

    async createProject(organizationId: string, name: string, description: string | null, createdBy: string) {
        const result = await pool.query(
            `INSERT INTO projects (organization_id, name, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
            [organizationId, name, description, createdBy]
        );
        return result.rows[0];
    },

    async getTasksByOrganization(organizationId: string) {
        const result = await pool.query(
            `SELECT t.*, 
      p.name as project_name,
      u_assigned.name as assigned_to_name,
      u_created.name as created_by_name
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
     LEFT JOIN users u_created ON t.created_by = u_created.id
     WHERE p.organization_id = $1
     ORDER BY t.created_at DESC`,
            [organizationId]
        );
        return result.rows;
    },

    async createTask(projectId: string, title: string, description: string | null, status: string, createdBy: string) {
        const result = await pool.query(
            `INSERT INTO tasks (project_id, title, description, status, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
            [projectId, title, description, status, createdBy]
        );
        return result.rows[0];
    },

    async getProjectById(projectId: string) {
        const result = await pool.query(
            `SELECT p.*, 
      u.name as creator_name,
      u.email as creator_email,
      o.name as organization_name
     FROM projects p
     LEFT JOIN users u ON p.created_by = u.id
     LEFT JOIN organizations o ON p.organization_id = o.id
     WHERE p.id = $1`,
            [projectId]
        );
        return result.rows[0] || null;
    },

    async getTasksByProject(projectId: string) {
        const result = await pool.query(
            `SELECT t.*, 
      u_assigned.name as assigned_to_name,
      u_created.name as created_by_name
     FROM tasks t
     LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
     LEFT JOIN users u_created ON t.created_by = u_created.id
     WHERE t.project_id = $1
     ORDER BY 
       CASE t.status 
         WHEN 'todo' THEN 1
         WHEN 'in_progress' THEN 2
         WHEN 'done' THEN 3
       END,
       t.created_at DESC`,
            [projectId]
        );
        return result.rows;
    },
};