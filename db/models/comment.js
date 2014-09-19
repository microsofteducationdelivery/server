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
    }
  });

  return Comment;
};
