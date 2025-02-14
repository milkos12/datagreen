const Sequelize = require('sequelize');
const db = require('../config/db');
// models/company.js
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    company_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, // Asumiendo que el nombre de la compañía es obligatorio
    },
    phone_number_owner: {
      type: DataTypes.STRING,
      allowNull: true, // Ajusta según tu lógica de negocio
    }
  }, {
    modelName: 'Company',
    tableName: 'Companies',
    timestamps: true
  });

  Company.associate = (models) => {
    Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
    Company.hasMany(models.Flow, { foreignKey: 'ownerCompanyId', as: 'flows' });
  };

  return Company;
};
