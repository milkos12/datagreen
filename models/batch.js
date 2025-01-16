'use strict';

module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define('Batch', {
    batch_id: {
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
    provider_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Providers',
        key: 'provider_id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'product_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'company_id'
      }
    }
  }, {
    modelName: 'Batch',
    tableName: 'Batches',
    timestamps: true
  });

  Batch.associate = (models) => {
    Batch.belongsTo(models.Provider, { foreignKey: 'provider_id', as: 'provider' });
    Batch.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    Batch.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Batch.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  };

  return Batch;
};
