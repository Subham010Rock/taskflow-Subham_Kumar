// backend/src/config/db.js

const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

// Create a connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Log when a new connection is created
pool.on('connect', () => {
  logger.info('New database connection established');
});

// Log database errors
pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
  process.exit(1);
});

module.exports = pool;