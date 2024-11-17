module.exports = (sequelize, DataTypes) => {
  const Measure = sequelize.define('Measure', {
    measure_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'company_id'
      }
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    }
  }, {
    modelName: 'Measure',
    tableName: 'Measures',
    timestamps: true,
  });

  Measure.associate = (models) => {
    Measure.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    Measure.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return Measure;
};
