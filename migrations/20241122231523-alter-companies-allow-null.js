'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Companies', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Companies', 'phone_number_owner', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Modificar las columnas de timestamps
    await queryInterface.changeColumn('Companies', 'createdAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Companies', 'updatedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Companies', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Companies', 'phone_number_owner', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Revertir las columnas de timestamps
    await queryInterface.changeColumn('Companies', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Companies', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  }
};
