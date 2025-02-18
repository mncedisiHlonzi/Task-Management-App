const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Main = require('./main'); // Assuming you also define the Main model

const Task = sequelize.define(
  'Task',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dueTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'low',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'userid',
    },
    reminder: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statusUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Optional initially
    },
  },
  {
    timestamps: true,
  }
);

// Hook: Insert into Main after a new Task is created
Task.afterCreate(async (task, options) => {
  await Main.create({
    title: task.title,
    description: task.description,
    dueTime: task.dueTime,
    priority: task.priority,
    status: task.status,
    userId: task.userId,
    reminder: task.reminder,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    statusUpdatedAt: task.statusUpdatedAt,
  });
});

// Hook: Update Main when a Task is updated
Task.afterUpdate(async (task, options) => {
  try {
    await Main.update(
      {
        title: task.title,
        description: task.description,
        dueTime: task.dueTime,
        priority: task.priority,
        status: task.status,
        reminder: task.reminder,
        updatedAt: task.updatedAt,
        statusUpdatedAt: task.statusUpdatedAt,
      },
      { where: { id: task.id } } // Ensure this matches the record in Main
    );
  } catch (error) {
    console.error('Error updating Main table:', error);
  }
});

// Hook: Delete from Main when a Task is deleted
Task.afterDestroy(async (task, options) => {
  try {
    await Main.destroy({ where: { id: task.id } }); // Ensure this matches the record in Main
  } catch (error) {
    console.error('Error deleting from Main table:', error);
  }
});

module.exports = Task;