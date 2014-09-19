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
      Folder.hasMany(Folder, { onDelete: 'cascade', as: 'children', foreignKey: 'parentId', useJunctionTable: false });
      Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId' });
      Folder.hasMany(models.Media,  { onDelete: 'cascade' });
    }
  });

  return Folder;
};
