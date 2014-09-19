module.exports = function (sequelize, DataTypes) {
  var Folder = sequelize.define('Folder', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, {
    associate: function(models) {
      Folder.belongsTo(models.Library);
      Folder.hasMany(Folder, { as: 'children', foreignKey: 'parentId', useJunctionTable: false });
      Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });
      Folder.hasMany(models.Media);
    }
  });

  return Folder;
};
