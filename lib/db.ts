// lib/db.ts - Updated for Neon serverless driver
import { neon } from '@neondatabase/serverless';

// Create a single instance of the database client to be reused
let sql: ReturnType<typeof neon>;

// Function to get the SQL client
export const getSqlClient = () => {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
};

// Create functions for database operations
export const getClient = async () => {
  return getSqlClient();
};

// Export the sql client directly for direct queries
export { getSqlClient as sql };

// Initialize database tables if they don't exist
export const initializeDatabase = async () => {
  const sql = getSqlClient();

  try {
    console.log('Initializing database tables...');

    // Create users table
    await sql(`
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
    await sql(`
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
    await sql(`
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
  }
};