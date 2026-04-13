
// Load test environment variables BEFORE anything else
process.env.DATABASE_URL = 'postgresql://taskflow:taskflow_secret_password@localhost:5432/taskflow_test_db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '24h';
process.env.PORT = '3001';
process.env.BCRYPT_COST = '4';

const pool = require('../src/config/db');

// Before all tests: clean the database
async function setupDatabase() {
  // Create tables if they don't exist (run migrations)
  // For tests, we'll just ensure tables are clean
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM users');
}

// After all tests: close database connection
async function teardownDatabase() {
  await pool.end();
}

module.exports = { setupDatabase, teardownDatabase, pool };