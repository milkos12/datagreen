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
  };

  return MessagePersistence;
};
