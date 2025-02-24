const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const sequelize = require('./config/database');
const cron = require('node-cron');
const { Op } = require('sequelize');
const Main = require('./models/main'); // Import the Main model
const Task  = require('./models/task');
const User = require('./models/user'); // Adjust the path as needed
const admin = require('./firebase'); // Import Firebase Admin SDK

const app = express();
const port = 3000; // Hardcoded PORT value

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serving static files from the uploads directory
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log(`Serving static files from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', routes);

// Fallback Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message || 'Internal Server Error');
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize Sequelize and Start Server
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync(); // Sync models with database tables
  })
  .then(() => {
    console.log('Database and tables are ready!');

    // Set up cron job to clear the Tasks table at 00:00 every day
    cron.schedule('0 0 * * *', async () => {
      try {
        await sequelize.query('DELETE FROM "Tasks";'); // Clear Tasks table
        console.log('Tasks table cleared at 00:00');
      } catch (error) {
        console.error('Error clearing Tasks table:', error);
      }
    });

    // Schedule a job to run every minute
    cron.schedule('* * * * *', async () => {
      try {
        // Get current time
        const now = new Date();

        // Find overdue tasks with pending status
        const overdueTasks = await Task.findAll({
          where: {
            status: 'pending',
            dueTime: { [Op.lt]: now }, // Tasks with dueTime less than now
          },
        });

        // Update the status of overdue tasks
        for (const task of overdueTasks) {
          task.status = 'Incompleted';
          task.statusUpdatedAt = now;
          await task.save();
          console.log(`Task ID ${task.id} marked as Incompleted.`);
        }
      } catch (error) {
        console.error('Error updating overdue tasks:', error);
      }
    });

    // Schedule a job to run every minute to check for reminders
    cron.schedule('* * * * *', async () => {
      try {
        // Get current time
        const now = new Date();

        // Find tasks with reminders due, pending status, and not reminded yet
        const tasksWithReminders = await Main.findAll({
          where: {
            status: 'pending',
            reminder: { [Op.lte]: now }, // Tasks with reminder time less than or equal to now
            isreminded: false, // Only tasks that haven't been reminded yet
          },
          include: [
            {
              model: User, // Include the User model
              as: 'user', // Use the alias defined in the association
              attributes: ['username'], // Fetch only the username
            },
          ],
        });

        // Send push notifications for each task
        for (const task of tasksWithReminders) {
          const { fcm_token, title, dueTime, user } = task;

          if (fcm_token && user) {
            const message = {
              notification: {
                title: 'Task Reminder',
                body: `Hello ${user.username}, Please don't forget to complete your pending task '${title}' due today at ${new Date(dueTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
              },
              token: fcm_token,
            };

            // Send the notification
            await admin.messaging().send(message);
            console.log(`Reminder sent for task ID ${task.id} to FCM token ${fcm_token}`);

            // Mark the task as reminded
            task.isreminded = true;
            await task.save();
            console.log(`Task ID ${task.id} marked as reminded.`);
          }
        }
      } catch (error) {
        console.error('Error sending reminders:', error);
      }
    });

    // Schedule a job to run every minute to check for incomplete tasks
    cron.schedule('* * * * *', async () => {
      try {
        // Get current time
        const now = new Date();

        // Find tasks with status 'Incompleted' and not reported yet
        const incompleteTasks = await Main.findAll({
          where: {
            status: 'Incompleted',
            isReported: false, // Only tasks that haven't been reported yet
          },
          include: [
            {
              model: User, // Include the User model
              as: 'user', // Use the alias defined in the association
              attributes: ['username'], // Fetch only the username
            },
          ],
        });

        // Send push notifications for each incomplete task
        for (const task of incompleteTasks) {
          const { fcm_token, title, dueTime, user } = task;

          if (fcm_token && user) {
            const message = {
              notification: {
                title: 'Task Incomplete',
                body: `Hello ${user.username}, your task '${title}' was due at ${new Date(dueTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} and is still incomplete. Please take action.`,
              },
              token: fcm_token,
            };

            // Send the notification
            await admin.messaging().send(message);
            console.log(`Incomplete task notification sent for task ID ${task.id} to FCM token ${fcm_token}`);

            // Mark the task as reported
            task.isReported = true;
            await task.save();
            console.log(`Task ID ${task.id} marked as reported.`);
          }
        }
      } catch (error) {
        console.error('Error sending incomplete task notifications:', error);
      }
    });

    // Start the Express server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at http://0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error.message || error);
    process.exit(1); // Exit with failure code if database connection fails
  });