var
  db = require('../db'),
  table = db.Media,
  koa = require('koa'),
  lib = db.Library,

  errors = require('../helper/errors'),
  C = require('../helper/constants'),
  excel = require('./createExcelExport'),
  excelbuilder = require('msexcel-builder'),
  fs = require('co-fs'),
  thunkify = require('co-thunkify'),
  _ = require('underscore'),
  send = require('send'),
  sendKoa = require('koa-send')
  ;

var app = koa();

module.exports = {
  getTop5Views: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });
    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'views DESC',
      limit: 5
    });
  },

  getTop5Downloads: function* (companyId) {
    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });

    return yield table.findAll({
      where: {LibraryId: libs},
      order: 'downloads DESC',
      limit: 5
    });
  },

  addToImport: function* (companyId) {

    var libs = yield lib.findAll({
      where: {CompanyId: companyId},
      attributes: ["id"]
    });
    libs = libs.map(function (lib) {
      return lib.dataValues.id;
    });

    var topDownloads = yield table.findAll({
      where: {LibraryId: libs},
      order: 'createdAt DESC'
    });

    var stringName = 'name|type|createdAt|downloads|views';
    return {
      fields: stringName,
      data: topDownloads
    };
  }

};
