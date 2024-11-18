// models/step.js

const Sequelize = require('sequelize');
const db = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const Step = sequelize.define('Step', {
    step_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Models', // References the Models table
        key: 'model_id'
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
    }
  }, {
    modelName: 'Step',
    tableName: 'Steps',
    timestamps: true
  });

  Step.associate = (models) => {
    // Association with Flow
    Step.belongsTo(models.Flow, { foreignKey: 'flowId', as: 'flow' });

    // Association with ModelItem
    Step.belongsTo(models.ModelItem, { foreignKey: 'modelId', as: 'model' });

    // Association with User
    Step.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
  };

  return Step;
};
