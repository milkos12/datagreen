const Sequelize = require('sequelize');
const db = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const FlowHistoryData = sequelize.define('FlowHistoryData', {
    flowHistoryData_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    flowHistoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'FlowHistories', // References the FlowHistories table
        key: 'flowHistory_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    stepId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Steps', // References the Steps table
        key: 'step_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    data: {
      type: DataTypes.JSON, // Assuming data is JSON; adjust as needed
      allowNull: true
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
    }
  }, {
    modelName: 'FlowHistoryData',
    tableName: 'FlowHistoryData',
    timestamps: true
  });

  FlowHistoryData.associate = (models) => {
    // Association with FlowHistory
    FlowHistoryData.belongsTo(models.FlowHistory, { foreignKey: 'flowHistoryId', as: 'flowHistory' });

    // Association with Step
    FlowHistoryData.belongsTo(models.Step, { foreignKey: 'stepId', as: 'step' });

    // Association with User
    FlowHistoryData.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
  };

  return FlowHistoryData;
};
