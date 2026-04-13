const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// All task routes require authentication
router.use(authMiddleware);

// PATCH /tasks/:id — Update a task
router.patch('/:id', taskController.update);

// DELETE /tasks/:id — Delete a task
router.delete('/:id', taskController.delete);

module.exports = router;