'use strict';

module.exports = (sequelize, DataTypes) => {
  const Provider = sequelize.define('Provider', {
    provider_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'company_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    }
  }, {
    modelName: 'Provider',
    tableName: 'Providers',
    timestamps: true,
  });

  Provider.associate = (models) => {
    Provider.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Provider.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Provider;
};
