'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Batches', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Batches', 'quantity_of_stems', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.changeColumn('Batches', 'provider_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Providers',
        key: 'provider_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'classification_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'product_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'product_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'measure_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Measures',
        key: 'measure_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'company_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'createdAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Batches', 'updatedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Batches', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Batches', 'quantity_of_stems', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    await queryInterface.changeColumn('Batches', 'provider_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Providers',
        key: 'provider_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'classification_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'product_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'product_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'measure_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Measures',
        key: 'measure_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'created_by', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'company_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Batches', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Batches', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  }
};
