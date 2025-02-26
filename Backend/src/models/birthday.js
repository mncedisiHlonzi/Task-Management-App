const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user'); // Import the User model

const Birthday = sequelize.define(
  'Birthday',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY, // Store only the date (YYYY-MM-DD)
      allowNull: false,
    },
    wish: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional field
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field
    },
    repeatYearly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default to false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference the User model
        key: 'id', // Reference the primary key of the User model
      },
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Define the association
Birthday.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Birthday;