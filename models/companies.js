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
        allowNull: false, // Asumiendo que el nombre de la compañía es obligatorio
        validate: {
          notEmpty: true
        }
      },
      phone_number_owner: {
        type: DataTypes.STRING,
        allowNull: false, // Ajusta según tu lógica de negocio
      }
    }, {
      modelName: 'Company',
      tableName: 'Companies',
      timestamps: true
    });
  
    Company.associate = (models) => {
      Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
    };
  
    return Company;
  };
  