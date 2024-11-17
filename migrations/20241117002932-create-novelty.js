'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Novelties', {
      novelty_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quantity_of_stems: {
        type: Sequelize.DECIMAL(10, 2), // Allows integers and decimals
        allowNull: false,
        validate: {
          min: 0
        }
      },
      batch_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Batches',
          key: 'batch_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      classification_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Classifications',
          key: 'classification_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      measure_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Measures',
          key: 'measure_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Novelties');
  }
};
