import { sql } from '../lib/db';
import { hashPassword } from '../lib/jwt';
import { UserRole } from '../lib/jwt-edge';

async function seedDatabase() {
  console.log('Seeding database...');

  const db = sql();

  try {
    // Check if superadmin already exists
    const superadminCheck = await db`
      SELECT id FROM users WHERE role = ${UserRole.SUPERADMIN}
    `;

    if (superadminCheck.length > 0) {
      console.log('Superadmin user already exists. Skipping seed.');
      return;
    }

    // Create a superadmin user
    const superadminPassword = await hashPassword('defaultSuperadminPassword123!');
    const barcodeData = JSON.stringify({
      userId: 'SUPERADMIN001',
      name: 'Super Admin',
      role: UserRole.SUPERADMIN
    });

    await db`
      INSERT INTO users (userId, name, email, password, role, barcodeData)
      VALUES (${'SUPERADMIN001'}, ${'Super Admin'}, ${'superadmin@example.com'}, ${superadminPassword}, ${UserRole.SUPERADMIN}, ${barcodeData})
    `;

    console.log('Superadmin user created successfully!');
    console.log('Email: superadmin@example.com');
    console.log('Password: defaultSuperadminPassword123! (change this immediately in production)');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

seedDatabase().catch(console.error);