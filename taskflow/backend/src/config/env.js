// backend/src/config/env.js

const dotenv = require('dotenv');

// Load .env file into process.env
dotenv.config();

// List all required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'PORT',
  'BCRYPT_COST',
];

// Check that each one exists
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    // If ANY variable is missing, crash immediately
    // Better to crash at startup than fail randomly later
    console.error(`❌ Missing environment variable: ${varName}`);
    process.exit(1);
  }
}

// Export all config in one clean object
module.exports = {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  server: {
    port: parseInt(process.env.PORT, 10),
  },
  bcrypt: {
    cost: parseInt(process.env.BCRYPT_COST, 10),
  },
};