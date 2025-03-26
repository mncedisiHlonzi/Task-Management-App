const express = require('express');
const router = express.Router();
const Main = require('../models/main');
const { Sequelize } = require('sequelize');
const { differenceInMinutes } = require('date-fns');

// GET /api/tasks - Fetch all tasks for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required' });
        }

        // Fetch tasks for the specified user ID from the Main model
        const tasks = await Main.findAll({ where: { userId } });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET /api/tasks-with-reminders - Fetch tasks with reminders for a user with pending status
router.get('/tasks-with-reminders', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required' });
        }

        // Fetch tasks with a non-null reminder and pending status for the specified user ID
        const tasksWithReminders = await Main.findAll({
            where: {
                userId,
                reminder: { [Sequelize.Op.ne]: null }, // Reminder field is not null
                status: 'pending', // Only fetch tasks with pending status
            },
            order: [['createdAt', 'DESC']], // Order tasks by creation date (descending)
        });

        res.status(200).json(tasksWithReminders);
    } catch (error) {
        console.error('Error fetching tasks with reminders:', error);
        res.status(500).json({ error: 'Failed to fetch tasks with reminders' });
    }
});

// GET /api/completed-tasks - Fetch completed tasks for a user and include time difference
router.get('/completed-tasks', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required' });
        }

        const completedTasks = await Main.findAll({
            where: {
                userId,
                status: 'completed', // Only fetch tasks with completed status
            },
            order: [['statusUpdatedAt', 'DESC']], // Order by statusUpdatedAt (descending)
        });

        // Function to format time difference
        const formatTimeDifference = (completionTime, dueTime) => {
            const diffInMillis = dueTime - completionTime;
            const diffInSeconds = Math.max(0, Math.floor(diffInMillis / 1000)); // Convert milliseconds to seconds
            const hours = Math.floor(diffInSeconds / 3600); // Convert to hours
            const minutes = Math.floor((diffInSeconds % 3600) / 60); // Convert remaining seconds to minutes
            const seconds = diffInSeconds % 60; // Remaining seconds

            let formattedTime = '';
            if (hours > 0) formattedTime += `${hours} hour${hours > 1 ? 's' : ''} `;
            if (minutes > 0) formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''} `;
            if (seconds > 0) formattedTime += `${seconds} second${seconds > 1 ? 's' : ''}`;

            return formattedTime.trim();
        };

        // Calculate the time difference for each task
        const tasksWithCompletionDetails = completedTasks.map((task) => {
            const completionTime = new Date(task.statusUpdatedAt);
            const dueTime = new Date(task.dueTime);
            const formattedTimeToDue = formatTimeDifference(completionTime, dueTime);

            return {
                ...task.toJSON(),
                completionTime,
                formattedTimeToDue,
            };
        });

        res.status(200).json(tasksWithCompletionDetails);
    } catch (error) {
        console.error('Error fetching completed tasks:', error);
        res.status(500).json({ error: 'Failed to fetch completed tasks' });
    }
});

// Update task experience
router.post('/update-task-experience', async (req, res) => {
    try {
        const { taskId, taskExperience } = req.body;

        if (!taskId || !taskExperience) {
            return res.status(400).json({ error: 'Task ID and experience are required.' });
        }

        const task = await Main.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Update the task experience
        task.taskExperience = taskExperience;
        await task.save();

        res.status(200).json({ message: 'Task experience updated successfully.', task });
    } catch (error) {
        console.error('Error updating task experience:', error);
        res.status(500).json({ error: 'Failed to update task experience.' });
    }
});

// GET /api/cancelled-tasks - Fetch cancelled tasks for a user
router.get('/cancelled-tasks', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required' });
        }

        const cancelledTasks = await Main.findAll({
            where: {
                userId,
                status: 'cancelled', // Fetch tasks with cancelled status
            },
            order: [['statusUpdatedAt', 'DESC']], // Order by statusUpdatedAt in descending order
        });

        // Function to format time difference
        const formatTimeDifference = (cancelTime, dueTime) => {
            const diffInMillis = dueTime - cancelTime;
            const diffInSeconds = Math.max(0, Math.floor(diffInMillis / 1000)); // Convert milliseconds to seconds
            const hours = Math.floor(diffInSeconds / 3600); // Convert to hours
            const minutes = Math.floor((diffInSeconds % 3600) / 60); // Convert remaining seconds to minutes
            const seconds = diffInSeconds % 60; // Remaining seconds

            let formattedTime = '';
            if (hours > 0) formattedTime += `${hours} hour${hours > 1 ? 's' : ''} `;
            if (minutes > 0) formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''} `;
            if (seconds > 0) formattedTime += `${seconds} second${seconds > 1 ? 's' : ''}`;

            return formattedTime.trim();
        };

        // Calculate the time difference for each cancelled task
        const tasksWithCancellationDetails = cancelledTasks.map((task) => {
            const cancelTime = new Date(task.statusUpdatedAt); // Use statusUpdatedAt for cancellation time
            const dueTime = new Date(task.dueTime);
            const formattedTimeToDue = formatTimeDifference(cancelTime, dueTime);

            return {
                ...task.toJSON(),
                cancelTime,
                formattedTimeToDue, // Return the formatted time difference
            };
        });

        res.status(200).json(tasksWithCancellationDetails);
    } catch (error) {
        console.error('Error fetching cancelled tasks:', error);
        res.status(500).json({ error: 'Failed to fetch cancelled tasks' });
    }
});

// Add cancel reason
router.post('/cancel-reason', async (req, res) => {
    try {
        const { taskId, cancelreason } = req.body;

        if (!taskId || !cancelreason) {
            return res.status(400).json({ error: 'Task ID and cancel reason are required.' });
        }

        const task = await Main.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Update the cancel reason
        task.cancelreason = cancelreason;
        await task.save();

        res.status(200).json({ message: 'Cancel reason updated successfully.', task });
    } catch (error) {
        console.error('Error updating cancel reason:', error);
        res.status(500).json({ error: 'Failed to update cancel reason.' });
    }
});

// GET /api/incompleted-tasks - Fetch incompleted tasks for a user
router.get('/incompleted-tasks', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required' });
        }

        const incompletedTasks = await Main.findAll({
            where: {
                userId,
                status: 'Incompleted', // Fetch tasks with incompleted status
            },
            order: [['statusUpdatedAt', 'DESC']], // Order by statusUpdatedAt in descending order
        });

        const tasksWithDetails = incompletedTasks.map((task) => {
            const dueTime = new Date(task.dueTime); // Task due time
            return {
                ...task.toJSON(),
                dueTime, // Include due time in the response
            };
        });

        res.status(200).json(tasksWithDetails);
    } catch (error) {
        console.error('Error fetching incompleted tasks:', error);
        res.status(500).json({ error: 'Failed to fetch incompleted tasks' });
    }
});

// GET /api/task-overview/:userId - Fetch task overview counts for a user
router.get('/task-overview/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required.' });
        }

        // Query counts based on task status
        const totalTasks = await Main.count({ where: { userId } });
        const pendingTasks = await Main.count({ where: { userId, status: 'pending' } });
        const completedTasks = await Main.count({ where: { userId, status: 'completed' } });
        const cancelledTasks = await Main.count({ where: { userId, status: 'cancelled' } });
        const incompleteTasks = await Main.count({ where: { userId, status: 'Incompleted' } });

        // Respond with overview counts
        res.status(200).json({
            totalTasks,
            pendingTasks,
            completedTasks,
            incompleteTasks,
            cancelledTasks,
        });
    } catch (error) {
        console.error('Error fetching task overview:', error);
        res.status(500).json({ error: 'Failed to fetch task overview.' });
    }
});

// Helper function to format time
function formatTime(minutes) {
    if (minutes < 1) return `${Math.round(minutes * 60)} seconds`; // Convert minutes to seconds
    if (minutes < 60) return `${Math.round(minutes)} minutes`; // Keep in minutes
    const hours = Math.round(minutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`; // Convert to hours
}

// GET /api/task-stats/:userId - Fetch task statistics for a user
router.get('/task-stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required.' });
        }

        // Fetch task data
        const totalTasks = await Main.count({ where: { userId } });
        const pendingTasks = await Main.count({ where: { userId, status: 'pending' } });
        const completedTasks = await Main.findAll({ where: { userId, status: 'completed' } });
        const cancelledTasks = await Main.count({ where: { userId, status: 'cancelled' } });
        const incompleteTasks = await Main.count({ where: { userId, status: 'Incompleted' } });

        // Calculate completion rate
        const completedCount = completedTasks.length;
        const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

        // Calculate cancellation rate
        const cancellationRate = totalTasks > 0 ? (cancelledTasks / totalTasks) * 100 : 0;

        // Calculate incomplete rate
        const incompleteRate = totalTasks > 0 ? (incompleteTasks / totalTasks) * 100 : 0;

        // Calculate pending rate
        const pendingRate = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;

        // Calculate average time to complete using statusUpdatedAt
        let totalCompletionTime = 0;
        completedTasks.forEach((task) => {
            if (task.statusUpdatedAt && task.createdAt) {
                const completionTime = differenceInMinutes(
                    new Date(task.statusUpdatedAt),
                    new Date(task.createdAt)
                );
                totalCompletionTime += completionTime;
            }
        });

        const averageTimeToComplete = completedCount > 0 ? totalCompletionTime / completedCount : 0;
        const formattedTime = formatTime(averageTimeToComplete); // Format the time

        res.status(200).json({
            pendingRate: pendingRate.toFixed(2),
            completionRate: completionRate.toFixed(2), // Format as percentage
            cancellationRate: cancellationRate.toFixed(2), // Format as percentage
            incompleteRate: incompleteRate.toFixed(2), // Format as percentage
            averageTimeToComplete: formattedTime, // Return formatted time
        });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ error: 'Failed to fetch task stats.' });
    }
});

// GET /api/task-priority/:userId - Fetch task priority counts for a user
router.get('/task-priority/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required.' });
        }

        // Query counts based on task priority
        const totalTasks = await Main.count({ where: { userId } });
        const LowPriorityTasks = await Main.count({ where: { userId, priority: 'low' } });
        const mediumPriorityTasks = await Main.count({ where: { userId, priority: 'medium' } });
        const highPriorityTasks = await Main.count({ where: { userId, priority: 'high' } });

        // Respond with overview counts
        res.status(200).json({
            totalTasks,
            LowPriorityTasks,
            mediumPriorityTasks,
            highPriorityTasks,
        });
    } catch (error) {
        console.error('Error fetching task overview:', error);
        res.status(500).json({ error: 'Failed to fetch task overview.' });
    }
});

// GET /api/priority-stats/:userId - Fetch priority statistics for a user
router.get('/priority-stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required.' });
        }

        // Fetch task data
        const totalTasks = await Main.count({ where: { userId } });
        const LowPriorityTasks = await Main.count({ where: { userId, priority: 'low' } });
        const mediumPriorityTasks = await Main.count({ where: { userId, priority: 'medium' } });
        const highPriorityTasks = await Main.count({ where: { userId, priority: 'high' } });

        // Calculate completion rates for each priority
        const lowRate = totalTasks > 0 ? (LowPriorityTasks / totalTasks) * 100 : 0;
        const mediumRate = totalTasks > 0 ? (mediumPriorityTasks / totalTasks) * 100 : 0;
        const highRate = totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0;

        res.status(200).json({
            lowRate: lowRate.toFixed(2),
            mediumRate: mediumRate.toFixed(2), // Format as percentage
            highRate: highRate.toFixed(2), // Format as percentage
        });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ error: 'Failed to fetch task stats.' });
    }
});

module.exports = router;