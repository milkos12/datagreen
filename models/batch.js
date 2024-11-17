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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    quantity_of_stems: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    provider_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Providers',
        key: 'provider_id'
      }
    },
    classification_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'product_id'
      }
    },
    measure_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Measures',
        key: 'measure_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    Batch.belongsTo(models.Classification, { foreignKey: 'classification_id', as: 'classification' });
    Batch.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    Batch.belongsTo(models.Measure, { foreignKey: 'measure_id', as: 'measure' });
    Batch.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Batch.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  };

  return Batch;
};
