// Barcode utility functions
// Note: PostgreSQL client is used dynamically in functions that run server-side only

// Generate user barcode data containing user ID, name and role
export const generateBarcodeData = (userId: string, name: string, role: string): string => {
  return JSON.stringify({
    userId,
    name,
    role,
    timestamp: Date.now()
  });
};

// Parse barcode data to extract user information
export const parseBarcodeData = (barcodeData: string): { userId: string; name: string; role: string } | null => {
  try {
    const parsed = JSON.parse(barcodeData);
    if (parsed.userId && parsed.name && parsed.role) {
      return {
        userId: parsed.userId,
        name: parsed.name,
        role: parsed.role
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing barcode data:', error);
    return null;
  }
};

// Validate user from barcode data
export const validateUserFromBarcode = async (barcodeData: string) => {
  const parsedData = parseBarcodeData(barcodeData);

  if (!parsedData) {
    throw new Error('Invalid barcode data');
  }

  // Find user in database
  const { Pool } = await import('pg');
  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT id, userId, name, email, role, isActive FROM users WHERE barcodeData = $1',
      [barcodeData]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error('User not found for this barcode');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    return user;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Validate user by ID (alternative to barcode)
export const validateUserById = async (userId: string) => {
  const { Pool } = await import('pg');
  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT id, userId, name, email, role, isActive, barcodeData FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    return user;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};