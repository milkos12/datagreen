'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "permitted_processes" en la tabla "Roles"
    await queryInterface.addColumn('Roles', 'permitted_processes', {
      type: Sequelize.ARRAY(Sequelize.UUID), // Array de UUIDs para los procesos permitidos
      allowNull: true, // Puede ser nulo
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "permitted_processes" en la tabla "Roles"
    await queryInterface.removeColumn('Roles', 'permitted_processes');
  }
};
