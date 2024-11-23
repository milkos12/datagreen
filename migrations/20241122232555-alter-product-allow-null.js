'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Products', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('Products', 'company_id', {
      type: Sequelize.UUID,
      allowNull: true, // Cambiado a true según tu solicitud
      references: {
        model: 'Companies',
        key: 'company_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Products', 'created_by', {
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
    await queryInterface.changeColumn('Products', 'createdAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Products', 'updatedAt', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Products', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Products', 'company_id', {
      type: Sequelize.UUID,
      allowNull: false, // Restaurado a false
      references: {
        model: 'Companies',
        key: 'company_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('Products', 'created_by', {
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
    await queryInterface.changeColumn('Products', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.changeColumn('Products', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  }
};
