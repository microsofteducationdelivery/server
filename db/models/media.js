module.exports = function (sequelize, DataTypes) {
  var Media = sequelize.define('Media', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    description: DataTypes.TEXT,
    links: DataTypes.TEXT,
    file: DataTypes.STRING,
    ty2pe: {
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
