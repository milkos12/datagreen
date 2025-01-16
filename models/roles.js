module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define('Roles', {
      role_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false // Role name is required
      },
      company_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      permitted_processes: {
        type: DataTypes.ARRAY(DataTypes.UUID), // Array of PermittedProcesses IDs
        allowNull: true
      }
    }, {
      modelName: 'Roles',
      tableName: 'Roles',
      timestamps: true
    });
  
    Roles.associate = (models) => {
      Roles.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
      Roles.belongsToMany(models.PermittedProcesses, {
        through: 'RoleProcesses',
        as: 'permittedProcesses',
        foreignKey: 'role_id',
        otherKey: 'process_id'
      });
    };
  
    return Roles;
  };
  