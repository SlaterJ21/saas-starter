import {Pool} from 'pg';
import {logger} from "@sentry/nextjs";
import * as Sentry from "@sentry/nextjs";

// Allow missing DATABASE_URL during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

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
        return Sentry.startSpan(
            {
                op: 'db.mutation',
                name: 'createUser',
            },
            async (span) => {
                span?.setAttribute('email', email);
                span?.setAttribute('auth0_id', auth0Id);
                console.log('Creating user with auth0Id:', auth0Id);
                logger.info('Creating new user', { email, auth0Id });
                const result = await pool.query(
                    `INSERT INTO users (auth0_id, email, name, avatar_url) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                    [auth0Id, email, name, avatarUrl]
                );
                logger.info('User created successfully', {
                    userId: result.rows[0].id,
                    email
                });
                return result.rows[0];
            }
        );
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

    async findOrCreateUser(auth0User: {
        auth0Id: string;
        email: string;
        name?: string;
        picture?: string;
    }) {
        let user = await this.findUserByAuth0Id(auth0User.auth0Id);
        if (!user) {
            console.log('User not found, creating with:', auth0User);
            user = await this.createUser(
                auth0User.auth0Id,
                auth0User.email,
                auth0User.name,
                auth0User.picture
            );
            // Auto-create personal organization for new users
            const personalOrgSlug = `${auth0User.email.split('@')[0]}-personal-${Date.now()}`;
            const personalOrg = await this.createOrganization(
                `${auth0User.name || auth0User.email}'s Organization`,
                personalOrgSlug,
                user.id
            );
            await this.addUserToOrganization(user.id, personalOrg.id, 'owner');
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
      p.organization_id,
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
      o.name as organization_name,
      o.id as organization_id
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

    async updateTaskStatus(taskId: string, status: string) {
        const result = await pool.query(
            `UPDATE tasks 
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
            [status, taskId]
        );
        return result.rows[0];
    },

    async updateTask(taskId: string, updates: {
        title?: string;
        description?: string;
        status?: string;
        assigned_to?: string | null;
    }) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updates.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push(`description = $${paramCount++}`);
            values.push(updates.description);
        }
        if (updates.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            values.push(updates.status);
        }
        if (updates.assigned_to !== undefined) {
            fields.push(`assigned_to = $${paramCount++}`);
            values.push(updates.assigned_to);
        }

        fields.push(`updated_at = NOW()`);
        values.push(taskId);

        const result = await pool.query(
            `UPDATE tasks 
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
            values
        );
        return result.rows[0];
    },

    async deleteTask(taskId: string) {
        await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    },

    async getTaskById(taskId: string) {
        const result = await pool.query(
            `SELECT t.*, 
      p.name as project_name,
      p.id as project_id,
      p.organization_id,
      u_assigned.name as assigned_to_name,
      u_created.name as created_by_name
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
     LEFT JOIN users u_created ON t.created_by = u_created.id
     WHERE t.id = $1`,
            [taskId]
        );
        return result.rows[0] || null;
    },

    async getOrganizationMembers(organizationId: string) {
        const result = await pool.query(
            `SELECT om.*, u.name, u.email, u.avatar_url, u.auth0_id
     FROM organization_members om
     JOIN users u ON om.user_id = u.id
     WHERE om.organization_id = $1
     ORDER BY 
       CASE om.role
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'member' THEN 3
         WHEN 'viewer' THEN 4
       END,
       om.joined_at ASC`,
            [organizationId]
        );
        return result.rows;
    },

    async updateMemberRole(organizationId: string, userId: string, newRole: string) {
        const result = await pool.query(
            `UPDATE organization_members 
     SET role = $1
     WHERE organization_id = $2 AND user_id = $3
     RETURNING *`,
            [newRole, organizationId, userId]
        );
        return result.rows[0];
    },

    async removeMemberFromOrganization(organizationId: string, userId: string) {
        await pool.query(
            `DELETE FROM organization_members 
     WHERE organization_id = $1 AND user_id = $2`,
            [organizationId, userId]
        );
    },

    async getUserByEmail(email: string) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    },

    async isUserInOrganization(userId: string, organizationId: string): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM organization_members 
     WHERE user_id = $1 AND organization_id = $2`,
            [userId, organizationId]
        );
        return result.rows.length > 0;
    },

    async updateUser(userId: string, updates: { name?: string; avatar_url?: string }) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updates.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(updates.name);
        }
        if (updates.avatar_url !== undefined) {
            fields.push(`avatar_url = $${paramCount++}`);
            values.push(updates.avatar_url);
        }

        values.push(userId);

        const result = await pool.query(
            `UPDATE users 
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
            values
        );
        return result.rows[0];
    },

    async updateOrganization(organizationId: string, updates: { name?: string; slug?: string }) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (updates.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(updates.name);
        }
        if (updates.slug !== undefined) {
            fields.push(`slug = $${paramCount++}`);
            values.push(updates.slug);
        }

        fields.push(`updated_at = NOW()`);
        values.push(organizationId);

        const result = await pool.query(
            `UPDATE organizations 
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
            values
        );
        return result.rows[0];
    },

    async deleteOrganization(organizationId: string) {
        await pool.query('DELETE FROM organizations WHERE id = $1', [organizationId]);
    },

    async getOrganizationMemberCount(organizationId: string): Promise<number> {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM organization_members WHERE organization_id = $1',
            [organizationId]
        );
        return parseInt(result.rows[0].count);
    },

    // ============================================
    // NOTIFICATIONS METHODS
    // ============================================

    async createNotification(data: {
        userId: string;
        organizationId: string;
        type: string;
        title: string;
        message: string;
        link?: string;
        createdBy?: string;
        metadata?: any;
    }) {
        const result = await pool.query(
            `INSERT INTO notifications 
       (user_id, organization_id, type, title, message, link, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                data.userId,
                data.organizationId,
                data.type,
                data.title,
                data.message,
                data.link || null,
                data.createdBy || null,
                data.metadata ? JSON.stringify(data.metadata) : null,
            ]
        );
        return result.rows[0];
    },

    async getUserNotifications(userId: string, limit = 50) {
        const result = await pool.query(
            `SELECT n.*, 
              u.name as created_by_name,
              u.avatar_url as created_by_avatar
       FROM notifications n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    },

    async getUnreadNotificationCount(userId: string) {
        const result = await pool.query(
            `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },

    async markNotificationAsRead(notificationId: string, userId: string) {
        const result = await pool.query(
            `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [notificationId, userId]
        );
        return result.rows[0];
    },

    async markAllNotificationsAsRead(userId: string) {
        await pool.query(
            `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
    },

    // ============================================
    // ACTIVITY LOG METHODS
    // ============================================

    async createActivity(data: {
        organizationId: string;
        userId: string;
        actionType: string;
        entityType: string;
        entityId?: string;
        description: string;
        metadata?: any;
    }) {
        const result = await pool.query(
            `INSERT INTO activity_log
       (organization_id, user_id, action_type, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                data.organizationId,
                data.userId,
                data.actionType,
                data.entityType,
                data.entityId || null,
                data.description,
                data.metadata ? JSON.stringify(data.metadata) : null,
            ]
        );
        return result.rows[0];
    },

    async getOrganizationActivity(organizationId: string, limit = 50) {
        const result = await pool.query(
            `SELECT a.*,
              u.name as user_name,
              u.avatar_url as user_avatar
       FROM activity_log a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.organization_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
            [organizationId, limit]
        );
        return result.rows;
    },
};