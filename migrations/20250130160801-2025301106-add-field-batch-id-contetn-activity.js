'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ContentActivities', 'batch_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Batches',
        key: 'batch_id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ContentActivities', 'batch_id');
  }
};
