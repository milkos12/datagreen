'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ContentBatches', 'product_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ContentBatches', 'product_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'product_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
