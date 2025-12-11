const crypto = require('crypto');

// Generate a secure random token
const token = crypto.randomBytes(32).toString('hex');
console.log('Generated Super Admin Registration Token:');
console.log(token);
console.log('\nAdd this to your .env file as:');
console.log(`SUPERADMIN_REGISTRATION_TOKEN="${token}"`);
console.log('\nThen access the registration form at:');
console.log(`http://localhost:3000/register-superadmin?token=${token}`);