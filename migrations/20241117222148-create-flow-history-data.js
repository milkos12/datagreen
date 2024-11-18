'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('FlowHistoryData', {
      flowHistoryData_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      flowHistoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FlowHistories', // References the FlowHistories table
          key: 'flowHistory_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      stepId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Steps', // References the Steps table
          key: 'step_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      data: {
        type: Sequelize.JSON, // Adjust the data type as needed
        allowNull: true
      },
      createdById: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // References the Users table
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('FlowHistoryData');
  }
};
