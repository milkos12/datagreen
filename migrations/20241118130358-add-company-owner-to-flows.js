'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Flows', 'ownerCompanyId', {
      type: Sequelize.UUID,
      references: {
        model: 'Companies',
        key: 'company_id'
      }, 
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'

    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Flows', 'ownerCompanyId');
  }
};
