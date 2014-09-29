module.exports = function (sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    text: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      }
    },
    author: {
      type: DataTypes.STRING,
      notEmpty: true
    },
    date: {
      type: DataTypes.STRING,
      notEmpty: true
    }
  }, {
    associate: function(models) {
      Comment.belongsTo(models.Media);
      Comment.hasMany(Comment, { onDelete: 'cascade', as: 'children', foreignKey: 'parentId', useJunctionTable: false });
      Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
    }
  });

  return Comment;
};
