import { initializeDatabase } from '../lib/db';

async function runInit() {
  console.log('Starting database initialization...');
  
  try {
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

runInit();