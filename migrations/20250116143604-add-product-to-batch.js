'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Batches', 'product_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'product_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Batches', 'product_id');
  }
};
