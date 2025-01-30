'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ContentBatches', 'batch_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Batches',
        key: 'batch_id'
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE' 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ContentBatches', 'batch_id');
  }
};
