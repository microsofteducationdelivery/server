module.exports = function (sequelize, DataTypes) {
  var Company = sequelize.define('Company', {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    motd: DataTypes.STRING
  }, {
    associate: function(models) {
      Company.hasMany(models.User);
      Company.hasMany(models.Library);
    }
  });

  return Company;
};