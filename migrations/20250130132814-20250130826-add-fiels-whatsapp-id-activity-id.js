'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('MessagePersistences', 'whatsapp_id', {
      type: Sequelize.STRING,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('MessagePersistences', 'activity_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Activities',
        key: 'activity_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('MessagePersistences', 'whatsapp_id');
    await queryInterface.removeColumn('MessagePersistences', 'activity_id');
  }
};
