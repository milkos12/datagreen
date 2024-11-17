'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      company_id: { // Clave primaria personalizada
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()') // Genera UUID en la base de datos
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone_number_owner: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('Companies');
  }
};
