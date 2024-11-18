const Sequelize = require('sequelize');
const db = require('../config/db');

module.exports = (sequelize, DataTypes) => {
  const Flow = sequelize.define('Flow', {
    flow_id: {
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
    ownerCompanyId: {
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
    modelName: 'Flow',
    tableName: 'Flows',
    timestamps: true
  });

  Flow.associate = (models) => {
    // Association with User
    Flow.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });

    // Association with Company
    Flow.belongsTo(models.Company, { foreignKey: 'ownerCompanyId', as: 'ownerCompany' });

    // Association with Steps
    Flow.hasMany(models.Step, { foreignKey: 'flowId', as: 'steps' });

    // Association with FlowHistory
    Flow.hasMany(models.FlowHistory, { foreignKey: 'flowId', as: 'flowHistories' });
    
  };

  return Flow;
};
