'use strict';

module.exports = (sequelize, DataTypes) => {
    const ContentActivity = sequelize.define('ContentActivity', {
      content_activity_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_created_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      user_encharge_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      content_batch_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ContentBatches',
          key: 'content_batch_id'
        }
      },
      quantity_of_stems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 0
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Activities',
          key: 'activity_id'
        }
      }
    }, {
      modelName: 'ContentActivity',
      tableName: 'ContentActivities',
      timestamps: true
    });

    ContentActivity.associate = (models) => {
      ContentActivity.belongsTo(models.User, { foreignKey: 'user_created_id', as: 'userCreated' });
      ContentActivity.belongsTo(models.User, { foreignKey: 'user_encharge_id', as: 'userEncharge' });
      ContentActivity.belongsTo(models.ContentBatch, { foreignKey: 'content_batch_id', as: 'contentBatch' });
      ContentActivity.belongsTo(models.Activity, { foreignKey: 'activity_id', as: 'activity' });
    };

    return ContentActivity;
};
