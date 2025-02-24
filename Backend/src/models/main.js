const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user'); // Import the User model

const Main = sequelize.define(
  'Main',
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
    },
    reminder: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statusUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    taskExperience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cancelreason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isreminded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isReported: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define the association
Main.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Main;