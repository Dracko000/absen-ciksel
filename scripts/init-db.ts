import { initializeDatabase } from '../lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

const initDb = async () => {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Database initialization completed successfully!');

    // Exit gracefully
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDb();