const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

// All project routes require authentication
router.use(authMiddleware);

// GET /projects — List projects
router.get('/', projectController.list);

// POST /projects — Create project
router.post('/', projectController.create);

// GET /projects/:id — Get project details
router.get('/:id', projectController.getById);

// PATCH /projects/:id — Update project
router.patch('/:id', projectController.update);

// DELETE /projects/:id — Delete project
router.delete('/:id', projectController.delete);

module.exports = router;