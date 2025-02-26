const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const mainRoutes = require('./mainRoutes');
const birthdayRoutes = require('./birthdayRoutes');

// Use user routes
router.use('/users', userRoutes);

// Use task routes
router.use('/tasks', taskRoutes);

// Use Main routes
router.use('/mains', mainRoutes);

// Use Birthday routes
router.use('/birthdays', birthdayRoutes);

module.exports = router;