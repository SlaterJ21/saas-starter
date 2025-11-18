import { Pool } from 'pg';

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
};