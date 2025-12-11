import { getPool } from '../lib/db.js';
import { hashPassword, UserRole } from '../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  const client = await getPool().connect();

  try {
    console.log('Seeding database with initial users...');

    // Check if users already exist to prevent duplicates
    const existingUsers = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);

    if (userCount > 0) {
      console.log('Database already contains users, skipping seed.');
      return;
    }

    // Hash passwords for the initial users
    const superAdminPassword = await hashPassword('SuperAdmin123!');
    const adminPassword = await hashPassword('Admin123!');
    const userPassword = await hashPassword('User123!');

    // Create barcode data for each user
    const superAdminBarcode = JSON.stringify({
      userId: 'SA001',
      name: 'Kepala Sekolah',
      role: UserRole.SUPERADMIN
    });

    const adminBarcode = JSON.stringify({
      userId: 'A001',
      name: 'Guru Admin',
      role: UserRole.ADMIN
    });

    const userBarcode = JSON.stringify({
      userId: 'U001',
      name: 'Murid User',
      role: UserRole.USER
    });

    // Insert Super Admin user (Kepala Sekolah)
    await client.query(
      `INSERT INTO users (id, userId, name, email, password, role, barcodeData, isActive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        'SA001',
        'Kepala Sekolah',
        'kepalasekolah@example.com',
        superAdminPassword,
        UserRole.SUPERADMIN,
        superAdminBarcode,
        true
      ]
    );

    // Insert Admin user (Guru)
    await client.query(
      `INSERT INTO users (id, userId, name, email, password, role, barcodeData, isActive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        'A001',
        'Guru Admin',
        'guru@example.com',
        adminPassword,
        UserRole.ADMIN,
        adminBarcode,
        true
      ]
    );

    // Insert regular user (Murid)
    await client.query(
      `INSERT INTO users (id, userId, name, email, password, role, barcodeData, isActive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        'U001',
        'Murid User',
        'murid@example.com',
        userPassword,
        UserRole.USER,
        userBarcode,
        true
      ]
    );

    console.log('Initial users created successfully!');
    console.log('- Super Admin (Kepala Sekolah): kepalasekolah@example.com / SuperAdmin123!');
    console.log('- Admin (Guru): guru@example.com / Admin123!');
    console.log('- User (Murid): murid@example.com / User123!');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedDatabase()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  });