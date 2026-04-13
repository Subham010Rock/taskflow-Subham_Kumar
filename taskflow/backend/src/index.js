
// STEP 1: Load configuration first (must be first!)
const config = require('./config/env');
const logger = require('./utils/logger');

// STEP 2: Import Express and create app
const express = require('express');
const app = express();

// STEP 3: Import route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

// STEP 4: Import middleware
const errorHandler = require('./middleware/errorHandler');

// STEP 5: Global middleware
// This tells Express to parse JSON request bodies
app.use(express.json());

// STEP 6: Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

// STEP 7: Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// STEP 8: Register routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

// STEP 9: 404 handler (no route matched)
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// STEP 10: Global error handler (must be LAST middleware)
app.use(errorHandler);

// STEP 11: Start the server
const server = app.listen(config.server.port, () => {
  logger.info(`Server started on port ${config.server.port}`);
});

// STEP 12: Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app; // Export for testing