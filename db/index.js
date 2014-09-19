var
  fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  config = require('../config').mysql,

  client = new Sequelize(config.dbname, config.user, config.password, {
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    logging: console.log
  }),

  models = {};
// read all models and import them into the "db" object
fs
  .readdirSync(__dirname + '/models')
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function (file) {
    var model = client.import(path.join(__dirname + '/models', file));
    models[model.name] = model;
  });

Object.keys(models).forEach(function (modelName) {
  if (models[modelName].options.hasOwnProperty('associate')) {
    models[modelName].options.associate(models);
  }
});

module.exports = models;
module.exports.client = client;
