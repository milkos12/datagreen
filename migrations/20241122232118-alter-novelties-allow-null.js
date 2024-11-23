'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Novelties', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.changeColumn('Novelties', 'quantity_of_stems', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true, // Cambiado a true según tu solicitud
      validate: {
        isDecimal: true,
        min: 0
      }
    });

    await queryInterface.changeColumn('Novelties', 'batch_id', {
      type: Sequelize.UUID,
      allowNull: true, // Cambiado a true según tu solicitud
      references: {
        model: 'Batches',
        key: 'batch_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'classification_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'measure_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Measures',
        key: 'measure_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true, // Cambiado a true según tu solicitud
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Modificar las columnas de timestamps
    await queryInterface.changeColumn('Novelties', 'createdAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Novelties', 'updatedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Novelties', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true // Originalmente allowNull: true, según tu modelo
    });

    await queryInterface.changeColumn('Novelties', 'quantity_of_stems', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false, // Restaurado a false
      validate: {
        isDecimal: true,
        min: 0
      }
    });

    await queryInterface.changeColumn('Novelties', 'batch_id', {
      type: Sequelize.UUID,
      allowNull: false, // Restaurado a false
      references: {
        model: 'Batches',
        key: 'batch_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'classification_id', {
      type: Sequelize.UUID,
      allowNull: true, // Originalmente allowNull: true
      references: {
        model: 'Classifications',
        key: 'classification_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'measure_id', {
      type: Sequelize.UUID,
      allowNull: true, // Originalmente allowNull: true
      references: {
        model: 'Measures',
        key: 'measure_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Novelties', 'created_by', {
      type: Sequelize.UUID,
      allowNull: false, // Restaurado a false
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Revertir las columnas de timestamps
    await queryInterface.changeColumn('Novelties', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Novelties', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  }
};
