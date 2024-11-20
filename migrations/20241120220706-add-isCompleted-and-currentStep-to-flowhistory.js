'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('FlowHistories', 'isCompleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('FlowHistories', 'currentStep', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FlowHistories', 'isCompleted');
    await queryInterface.removeColumn('FlowHistories', 'currentStep');
  }
};
