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
        allowNull: false
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

      // Associations with Flow, ModelItem, and Step
      User.hasMany(models.Flow, { foreignKey: 'createdById', as: 'flows' });
      User.hasMany(models.ModelItem, { foreignKey: 'createdById', as: 'models' });
      User.hasMany(models.Step, { foreignKey: 'createdById', as: 'steps' });

      // Associations with FlowHistory and FlowHistoryData
      User.hasMany(models.FlowHistory, { foreignKey: 'createdById', as: 'flowHistories' });
      User.hasMany(models.FlowHistoryData, { foreignKey: 'createdById', as: 'flowHistoryData' });
      User.hasMany(models.FlowHistoryData, { foreignKey: 'createdById', as: 'messagePersistence' });
    };
  
    return User;
  };
  