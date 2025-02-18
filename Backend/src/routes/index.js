const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const mainRoutes = require('./mainRoutes');

// Use user routes
router.use('/users', userRoutes);

// Use task routes
router.use('/tasks', taskRoutes);

// Use Main routes
router.use('/mains', mainRoutes);

module.exports = router;