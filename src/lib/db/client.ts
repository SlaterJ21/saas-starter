import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

console.log('Initializing database pool with:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  
  async findUserByAuth0Id(auth0Id: string) {
    console.log('Looking for user with auth0_id:', auth0Id);
    const result = await pool.query(
      'SELECT * FROM users WHERE auth0_id = $1',
      [auth0Id]
    );
    console.log('Found user:', result.rows[0] ? 'YES' : 'NO');
    return result.rows[0] || null;
  },
  
  async createUser(auth0Id: string, email: string, name?: string, avatarUrl?: string) {
    console.log('Creating user:', { auth0Id, email, name });
    const result = await pool.query(
      `INSERT INTO users (auth0_id, email, name, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [auth0Id, email, name, avatarUrl]
    );
    console.log('User created:', result.rows[0]);
    return result.rows[0];
  },
  
  async findOrCreateUser(auth0User: any) {
    console.log('findOrCreateUser called for:', auth0User.sub);
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
      console.log('Created new user:', user.id, user.email);
    } else {
      console.log('User already exists:', user.id, user.email);
    }
    
    return user;
  },
};
