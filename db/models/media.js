module.exports = function (sequelize, DataTypes) {
  var Media = sequelize.define('Media', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    views: DataTypes.INTEGER,
    downloads: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    links: DataTypes.TEXT,
    file: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('video', 'image', 'text'),
      allowNull: false
    }
  }, {
    associate: function(models) {
      Media.belongsTo(models.Library);
      Media.belongsTo(models.Folder);
    }
  });

  return Media;
};
