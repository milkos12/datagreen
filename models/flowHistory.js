const Sequelize = require('sequelize');
const db = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const FlowHistory = sequelize.define('FlowHistory', {
    flowHistory_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    flowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Flows', // References the Flows table
        key: 'flow_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // References the Users table
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    currentStep: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    modelName: 'FlowHistory',
    tableName: 'FlowHistories',
    timestamps: true
  });

  FlowHistory.associate = (models) => {
    // Association with Flow
    FlowHistory.belongsTo(models.Flow, { foreignKey: 'flowId', as: 'flow' });

    // Association with User
    FlowHistory.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });

    // Association with FlowHistoryData
    FlowHistory.hasMany(models.FlowHistoryData, { foreignKey: 'flowHistoryId', as: 'flowHistoryData' });
  };

  return FlowHistory;
};
