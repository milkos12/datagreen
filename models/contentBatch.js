'use strict';

module.exports = (sequelize, DataTypes) => {
    const ContentBatch = sequelize.define('ContentBatch', {
      content_batch_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
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
        allowNull: false,
        references: {
          model: 'Classifications',
          key: 'classification_id'
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
      quantity_of_stems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 0
        }
      }
    }, {
      modelName: 'ContentBatch',
      tableName: 'ContentBatches',
      timestamps: true
    });
  
    ContentBatch.associate = (models) => {
      ContentBatch.belongsTo(models.Batch, { foreignKey: 'batch_id', as: 'batch'});
      ContentBatch.belongsTo(models.Classification, { foreignKey: 'classification_id', as: 'classification' });
      ContentBatch.belongsTo(models.Measure, { foreignKey: 'measure_id', as: 'measure' });
    };
  
    return ContentBatch;
  };