const Sequelize = require('sequelize');
const db = require('../config/db');
// models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'company_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    }, {
      modelName: 'User',
      tableName: 'Users',
      timestamps: true
    });
  
    User.associate = (models) => {
      User.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    };
  
    return User;
  };
  