const { Sequelize  } = require('sequelize');

const sequelize = new Sequelize('datagreen', 'postgres', 'root', {
    host: 'localhost',
    dialect: 'postgres'
});



module.exports = sequelize;