import { getPool } from '../lib/db.js';

const verifyConnection = async () => {
  const client = await getPool().connect();

  try {
    console.log('Testing database connection...');

    // Test basic connection
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully! Current time from DB:', result.rows[0].now);

    // Count users
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log('Total users in database:', userCount.rows[0].count);

    // Get all users
    const users = await client.query('SELECT id, userId, name, email, role FROM users');
    console.log('\nUsers in database:');
    users.rows.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user.email}`);
    });

    // Test attendance table
    const attendanceCount = await client.query('SELECT COUNT(*) FROM attendance');
    console.log('\nTotal attendance records:', attendanceCount.rows[0].count);

    // Test activity_logs table
    const activityCount = await client.query('SELECT COUNT(*) FROM activity_logs');
    console.log('Total activity logs:', activityCount.rows[0].count);

  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

verifyConnection()
  .then(() => {
    console.log('\nDatabase verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database verification failed:', error);
    process.exit(1);
  });