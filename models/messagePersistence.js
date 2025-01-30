'use strict';

module.exports = (sequelize, DataTypes) => {
  const MessagePersistence = sequelize.define('MessagePersistence', {
    message_persistence_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    activity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Activities',
        key: 'activity_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    whatsapp_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messages: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false
    }
  }, {
    modelName: 'MessagePersistence',
    tableName: 'MessagePersistences',
    timestamps: true
  });

  MessagePersistence.associate = (models) => {
    MessagePersistence.belongsTo(models.User, { foreignKey: 'user_id', as: 'createdById' });
    MessagePersistence.belongsTo(models.Activity, { foreignKey: 'activity_id', as: 'activity' });
  };

  return MessagePersistence;
};
