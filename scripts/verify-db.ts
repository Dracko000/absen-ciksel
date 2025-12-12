import { sql } from '../lib/db';

async function verifyDatabase() {
  console.log('Verifying database connection and tables...');

  try {
    const db = sql();

    // Test connection by running a simple query
    const result = await db`SELECT NOW()`;
    console.log('✓ Database connection successful:', result[0].now);

    // Check if users table exists
    const usersTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `;

    if (usersTable[0].exists) {
      console.log('✓ Users table exists');
    } else {
      console.log('✗ Users table does not exist');
    }

    // Check if attendance table exists
    const attendanceTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'attendance'
      )
    `;

    if (attendanceTable[0].exists) {
      console.log('✓ Attendance table exists');
    } else {
      console.log('✗ Attendance table does not exist');
    }

    // Check if activity_logs table exists
    const activityLogsTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'activity_logs'
      )
    `;

    if (activityLogsTable[0].exists) {
      console.log('✓ Activity logs table exists');
    } else {
      console.log('✗ Activity logs table does not exist');
    }

    console.log('Database verification completed!');
  } catch (error) {
    console.error('Database verification failed:', error);
    throw error;
  }
}

verifyDatabase().catch(console.error);