-- SQL schema for Absensi Sekolah application

-- Create the users table
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
);

-- Create the attendance table
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
);

-- Create the activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'LOGIN', 'ATTENDANCE_TAKEN', etc.
  description TEXT NOT NULL,
  ipAddress INET NULL,
  userAgent TEXT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);