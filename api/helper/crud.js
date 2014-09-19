var
  parse = require('co-body'),
  koa = require('koa'),
  route = require('koa-route'),
  _ = require('lodash');

module.exports = function (service, customActions) {
  customActions = customActions || {}
  var app = koa();
  var actions = _.assign({
    index: function* () {
      this.body = yield service.list(this.user);
    },

    create: function* () {
      yield service.add(yield parse(this), this.user);
      this.status = 201;
    },

    show: function* (id) {
      try {
        var doc = yield service.findById(id, this.user);
        if (!doc) {
          this.status = 404;
        } else {
          this.body = doc;
        }
      } catch (e) {
        this.status = 400;
      }
    },

    update: function* (id) {
      yield service.update(id, yield parse(this), this.user);
      this.status = 204;
    },

    destroyMultiple: function* () {
      yield service.removeMultiple(yield parse(this), this.user);
      this.status = 204;
    }
  }, customActions);

  app.use(route.get('/', actions.index));
  app.use(route.get('/:id', actions.show));
  app.use(route.put('/:id', actions.update));
  app.use(route.post('/', actions.create));
  app.use(route.delete('/', actions.destroyMultiple));

  return app;
};

