'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Providers', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Providers', 'document_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Providers', 'phone_number');
    await queryInterface.removeColumn('Providers', 'document_number');
  }
};
