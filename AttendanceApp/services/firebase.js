// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock data store for demo purposes (in production, remove this and use actual Firestore)
let mockUsers = [
  { id: '1', email: 'kepsek@example.com', password: 'password', role: 'kepsek', name: 'Kepala Sekolah' },
  { id: '2', email: 'guru@example.com', password: 'password', role: 'guru', name: 'Guru' },
  { id: '3', email: 'murid@example.com', password: 'password', role: 'murid', name: 'Murid' },
];

let mockAttendance = [];

// Function to get users from mock data (will be replaced with Firestore in production)
export const getUsers = async () => {
  return mockUsers;
};

// Function to get user by email and password (will be replaced with Firestore in production)
export const getUserByEmailAndPassword = async (email, password) => {
  return mockUsers.find(user => user.email === email && user.password === password);
};

// Function to record attendance
export const recordAttendance = async (userId, userName, userType, scannerId, scannerType) => {
  const attendanceRecord = {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // Generate a unique ID
    userId,
    userName,
    userType,
    scannerId,
    scannerType,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  };

  // Add to mock data (in production, this would be stored in Firestore)
  mockAttendance.push(attendanceRecord);
  
  console.log('Attendance recorded:', attendanceRecord);
  return attendanceRecord;
};

// Function to get attendance records by date range and user type
export const getAttendanceByDateRange = async (startDate, endDate, userType = null) => {
  // Filter mock data by date range (in production, this would query Firestore)
  let filteredAttendance = mockAttendance.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });

  // Filter by user type if specified
  if (userType) {
    filteredAttendance = filteredAttendance.filter(record => record.userType === userType);
  }

  // Sort by timestamp (newest first)
  filteredAttendance.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return filteredAttendance;
};

// Export the database instance in case direct access is needed
export { db };