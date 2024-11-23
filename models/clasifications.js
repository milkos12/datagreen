'use strict';

module.exports = (sequelize, DataTypes) => {
  const Classification = sequelize.define('Classification', {
    classification_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'company_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    }
  }, {
    modelName: 'Classification',
    tableName: 'Classifications',
    timestamps: true,
  });

  Classification.associate = (models) => {
    Classification.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Classification.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Classification;
};
