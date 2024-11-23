'use strict';

module.exports = (sequelize, DataTypes) => {
  const Novelty = sequelize.define('Novelty', {
    novelty_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity_of_stems: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Batches',
        key: 'batch_id'
      }
    },
    classification_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      }
    },
    measure_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Measures',
        key: 'measure_id'
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
    modelName: 'Novelty',
    tableName: 'Novelties',
    timestamps: true
  });

  Novelty.associate = (models) => {
    Novelty.belongsTo(models.Batch, { foreignKey: 'batch_id', as: 'batch' });
    Novelty.belongsTo(models.Classification, { foreignKey: 'classification_id', as: 'classification' });
    Novelty.belongsTo(models.Measure, { foreignKey: 'measure_id', as: 'measure' });
    Novelty.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Novelty;
};
