'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('MessagePersistences', {
      message_persistence_id: { // Clave primaria
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()') // Genera UUID en la base de datos
      },
      user_id: { // Foránea al modelo Users
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Users', // Nombre de la tabla referenciada
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      messages: { // Campo de tipo array con JSON
        type: Sequelize.ARRAY(Sequelize.JSON),
        allowNull: true
      },
      createdAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: { // Timestamps
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('MessagePersistences');
  }
};
