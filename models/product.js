'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'company_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    }
  }, {
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Product.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Product;
};
