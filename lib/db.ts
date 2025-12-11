// lib/db.ts - Optimized for serverless functions
import { Pool } from 'pg';

// Create a single instance of the pool to be reused
let pool: Pool;

// Initialize the pool based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  // Production: use SSL for NeonDB compatibility
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Connection pool settings optimized for serverless
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  // Development: no SSL required
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    min: 0,
    max: 10,
  });
}

// Create functions for database operations
export const getClient = async () => {
  return await pool.connect();
};

// Export the pool directly for direct queries
export { pool };

// Get pool function for use in scripts
export const getPool = () => {
  return pool;
};

// Initialize database tables if they don't exist
export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('Initializing database tables...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        barcodeData TEXT,
        classId VARCHAR(50),
        subject VARCHAR(100),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID NOT NULL REFERENCES users(id),
        date TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
        note TEXT,
        recordedBy UUID NOT NULL REFERENCES users(id),
        attendanceType VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create activity_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ipAddress INET,
        userAgent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};