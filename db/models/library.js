module.exports = function (sequelize, DataTypes) {
  var Library = sequelize.define('Library', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, {
    indexes: [
      {
        name: 'company_lib_uniq',
        unique: true,
        fields: ['name', 'CompanyId']
      }
    ],
    associate: function(models) {
      Library.belongsTo(models.Company);
      Library.hasMany(models.Folder, { onDelete: 'cascade' });
      Library.hasMany(models.Media, { onDelete: 'cascade' });
      Library.hasMany(models.User);
    }
  });

  return Library;
};
