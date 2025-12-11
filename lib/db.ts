import { Pool } from 'pg';
import { config } from 'dotenv';

// Use dotenv only in development or for initializing outside Next.js
if (typeof window === 'undefined') {
  config(); // Load environment variables only on the server side
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

// Create a single pool instance to reuse connections
let pool: Pool | null = null;

/**
 * Get a database pool instance
 * Reuses the same pool for efficiency
 */
export const getPool = () => {
  if (!pool) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // For NeonDB compatibility
      }
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      pool = null; // Reset pool on error
    });
  }

  return pool;
};

/**
 * Initialize database tables
 */
export const initializeDatabase = async () => {
  const client = await getPool().connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL, -- 'SUPERADMIN', 'ADMIN', 'USER'
        barcodeData TEXT UNIQUE NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        classId VARCHAR(100) NULL, -- For students only
        subject VARCHAR(100) NULL  -- For teachers only
      )
    `);

    // Create attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        attendanceType VARCHAR(20) NOT NULL, -- 'GURU' for teacher, 'MURID' for student
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE'
        location VARCHAR(255) NULL,
        deviceInfo TEXT NULL,
        recordedBy VARCHAR(255) NOT NULL, -- ID of the user who recorded the attendance
        note TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create activity logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL, -- 'LOGIN', 'ATTENDANCE_TAKEN', etc.
        description TEXT NOT NULL,
        ipAddress INET NULL,
        userAgent TEXT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(userId, date);
      CREATE INDEX IF NOT EXISTS idx_attendance_type_date ON attendance(attendanceType, date);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(userId, timestamp);
    `);

    console.log('Database tables created/verified successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Health check for the database connection
 */
export const testConnection = async () => {
  const client = await getPool().connect();

  try {
    // Simple query to test the connection
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    client.release();
  }
};