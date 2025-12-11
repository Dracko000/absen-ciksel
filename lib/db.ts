import { Pool } from 'pg';

// PostgreSQL connection configuration for NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // For NeonDB compatibility
  }
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to NeonDB');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export default pool;