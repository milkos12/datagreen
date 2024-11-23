// models/modelItem.js

const Sequelize = require('sequelize');
const db = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const ModelItem = sequelize.define('ModelItem', {
    model_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
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
    requiredFields: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    idName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idNameModel: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    modelName: 'ModelItem',
    tableName: 'Models',
    timestamps: true
  });

  ModelItem.associate = (models) => {
    // Association with User
    ModelItem.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });

    // Association with Steps
    ModelItem.hasMany(models.Step, { foreignKey: 'modelId', as: 'steps' });
  };

  return ModelItem;
};
