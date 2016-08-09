module.exports = function (sequelize, DataTypes) {
  var shareLibrariesCompany = sequelize.define('shareLibrariesCompany', {
    allow: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['CompanyId', 'LibraryId']
      },
    ],
    associate: function(models) {
      shareLibrariesCompany.belongsTo(models.Company);
      shareLibrariesCompany.belongsTo(models.Library);
    }
  });

  return shareLibrariesCompany;
};
