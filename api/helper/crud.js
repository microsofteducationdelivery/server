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
      try {
        this.body = yield service.list(this.user);
      } catch (e) {
        this.body = 404;
      }

    },

    create: function* () {
      var body = yield service.add(yield parse(this), this.user);
      if (body) {
        this.status = 201;
        this.body = body;
      } else {
        this.status = 500;
      }

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
        this.status = 404;
      }
    },

    update: function* (id) {
      try {
        yield service.update(id, yield parse(this), this.user);
        this.status = 204;
      } catch (e) {
        this.status = 500;
      }

    },

    destroyMultiple: function* () {
      try {
        yield service.removeMultiple(yield parse(this), this.user);
        this.status = 204;
      } catch (e) {
        this.status = 500;
      }

    }
  }, customActions);

  app.use(route.get('/', actions.index));
  app.use(route.get('/:id', actions.show));
  app.use(route.put('/:id', actions.update));
  app.use(route.post('/', actions.create));
  app.use(route.delete('/', actions.destroyMultiple));

  return app;
};

