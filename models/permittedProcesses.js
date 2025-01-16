module.exports = (sequelize, DataTypes) => {
    const PermittedProcesses = sequelize.define('PermittedProcesses', {
      process_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false // Process name is required
      }
    }, {
      modelName: 'PermittedProcesses',
      tableName: 'PermittedProcesses',
      timestamps: true
    });
  
    PermittedProcesses.associate = (models) => {
      PermittedProcesses.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    };
  
    return PermittedProcesses;
  };