'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('FlowHistories', 'modelId', {
      type: Sequelize.UUID,
      allowNull: true, 
      references: {
        model: 'Models', 
        key: 'model_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FlowHistories', 'modelId');
  }
};
