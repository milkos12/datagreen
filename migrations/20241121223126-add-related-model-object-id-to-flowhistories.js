'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('FlowHistories', 'relatedModelObjectId', {
      type: Sequelize.UUID, 
      allowNull: true 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FlowHistories', 'relatedModelObjectId');
  }
};
