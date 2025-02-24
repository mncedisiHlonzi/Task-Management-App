//routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { Sequelize } = require('sequelize');

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueTime, priority, userId, fcm_token } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Validate and sanitize dueTime input
    const validatedDueTime = Date.parse(dueTime);
    if (isNaN(validatedDueTime)) {
      return res.status(400).json({ error: 'Invalid dueTime format' });
    }

    // Ensure dueTime is in UTC (if not already)
    const utcDueTime = new Date(validatedDueTime).toISOString(); // Convert to UTC

    const newTask = await Task.create({
      title,
      description,
      dueTime: utcDueTime, // Use the validated UTC timestamp
      priority,
      status: 'pending',
      userId,
      fcm_token, // Store the FCM token
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /api/tasks - Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch tasks for the specified user ID, ordered by the latest task update time
    const tasks = await Task.findAll({
      where: { userId },
      order: [
        ['statusUpdatedAt', 'DESC'], // Order by statusUpdatedAt in descending order to get the most recent tasks first
      ],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PUT /api/tasks/:id - Update a task's status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find and update the task
    const task = await Task.findByPk(id);
    if (task) {
      task.status = status;  // Update task status
      task.statusUpdatedAt = new Date(); // Update statusUpdatedAt timestamp
      await task.save();  // Save the updated task
      res.status(200).json({ message: 'Task status updated successfully.' });
    } else {
      res.status(404).json({ error: 'Task not found.' });
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// PUT /api/tasks/:id/reminder - Set a task reminder
router.put('/:id/reminder', async (req, res) => {
  try {
    const { reminder } = req.body;
    const taskId = req.params.id;

    if (!reminder) {
      return res.status(400).json({ error: 'Reminder time is required' });
    }

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the task is completed or cancelled
    if (task.status === 'completed' || task.status === 'cancelled') {
      return res
        .status(400)
        .json({ error: `Cannot set a reminder for a ${task.status} task.` });
    }

    const dueTimeUTC = new Date(task.dueTime); // Already stored as UTC
    const reminderTime = new Date(
      `${dueTimeUTC.toISOString().split('T')[0]}T${reminder}:00Z`
    );

    const nowUTC = new Date();

    // Ensure the reminder is not in the past or after the due time
    if (reminderTime < nowUTC) {
      return res.status(400).json({ error: 'Reminder cannot be in the past.' });
    }

    if (reminderTime >= dueTimeUTC) {
      return res
        .status(400)
        .json({ error: 'Reminder must be set before the task due time.' });
    }

    // Update reminder with new time and reset isReminded to false
    task.reminder = reminderTime.toISOString();
    task.isreminded = false; // Reset isReminded to false
    await task.save();

    res.status(200).json({ message: `Reminder set to ${reminderTime.toISOString()}` });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the task
    const task = await Task.findByPk(id);
    if (task) {
      await task.destroy(); // Delete the task
      res.status(200).json({ message: 'Task deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Task not found.' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router; 