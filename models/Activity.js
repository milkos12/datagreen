module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define('Activity', {
      activity_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'company_id',
        }
      }
    }, {
      modelName: 'Activity',
      tableName: 'Activities',
      timestamps: true
    });
  
    Activity.associate = (models) => {
      Activity.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    };
  
    return Activity;
  };
  