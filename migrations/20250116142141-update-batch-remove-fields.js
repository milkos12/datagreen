'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Batches', 'classification_id');
    await queryInterface.removeColumn('Batches', 'product_id');
    await queryInterface.removeColumn('Batches', 'measure_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Batches', 'classification_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Classifications',
        key: 'classification_id'
      }
    });
    await queryInterface.addColumn('Batches', 'product_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'product_id'
      }
    });
    await queryInterface.addColumn('Batches', 'measure_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Measures',
        key: 'measure_id'
      }
    });
  }
};
