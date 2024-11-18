'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Steps', {
      step_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      flowId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Flows', // References the Flows table
          key: 'flow_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      modelId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Models', // References the Models table
          key: 'model_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Steps');
  }
};
