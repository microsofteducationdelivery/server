//FIXME: rewrite
var app = require('koa')(),
  db = require('../../db'),
  datauri = require('datauri'),
  parse = require('co-body'),
  route = require('koa-route'),

  mediaService = require('../../service/media'),
  mobileService = require('../../service/mobile')
;

function *data() {
  var company = yield this.user.getCompany();
  this.body = {
    motd: company.motd || '',
    data: yield mobileService.getContent(this.user)
  };
}

function *getComments(id) {
  var media = yield mediaService.findById(id, this.user);
  yield media.increment('views', 1);
  this.body = yield media.getComments();
}


function *getDetails(id) {
  var typeToExtension = {
    video: 'mp4',
    image: 'png',
    text: 'txt'
  };

  var media = yield mediaService.findById(id, this.user);
  yield media.increment('downloads', 1);
  this.body = {
    id: media.id,
    title: media.name,
    description: media.description,
    links: media.links.split('\n'),
    subtype: typeToExtension[media.type]
  };
}

function *postComments() {
  var data = yield parse(this);
  var media = yield mediaService.findById(data.id, this.user);
  delete data.id;

  this.status = 204;
  var date = new Date();
  data.date = date.toISOString().substr(0,10);
  data.author = this.user.name;
  var comment = yield db.Comment.create(data);


  yield media.addComment(comment);
}

app.use(route.get('/data', data));
app.use(route.get('/comments/:id', getComments));
app.use(route.get('/media/:id', getDetails));
app.use(route.post('/comments', postComments));
module.exports = app;
