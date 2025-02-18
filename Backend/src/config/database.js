const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tasks_db', 'postgres', 'tycoon1st', {
    host: 'localhost',
    dialect: 'postgres',
    logging: console.log,
});

module.exports = sequelize;