var
  db = require('./db'),
  co = require('co'),
  bcrypt = require('bcrypt-nodejs')
;

module.exports = co(function* () {
  if (!process.env.DEBUG) {
    return;
  }
  yield db.client.query('SET FOREIGN_KEY_CHECKS = 0');
  yield db.client.sync({ force: true });
  yield db.client.query('SET FOREIGN_KEY_CHECKS = 1');

  var company = yield db.Company.create({
    name: 'Test'
  });

  var user = db.User.build({
    name: 'Demo user',
    login: 'demo',
    token: '',
    email: 'demo@demo.me',
    password: bcrypt.hashSync('demo'),
    type: 'admin',
    deviceId: '',
    singleDevice: false
  });

  var user2 = db.User.build({
    name: 'Demo user2',
    login: 'demo2',
    token: '',
    email: 'demo2@mailinator.com',
    password: bcrypt.hashSync('demo2'),
    type: 'operator'
  });

  var user3 = db.User.build({
    name: 'Demo user3',
    login: 'demo3',
    token: '',
    phone: '+380504020799',
    password: bcrypt.hashSync('demo3'),
    type: 'mobile'
  });


  var library1 = yield db.Library.create({name: 'Lib1'});
  var library2 = yield db.Library.create({name: 'Lib2'});
  var library3 = yield db.Library.create({name: 'Lib3'});

  yield user.save();
  yield user2.save();
  yield user3.save();

  yield company.addLibrary(library1);
  yield company.addLibrary(library2);
  yield company.addLibrary(library3);
  yield company.addUser(user);
  yield company.addUser(user2);
  yield company.addUser(user3);

  var folder1 = yield db.Folder.create({name: 'Folder1'});
  var folder2 = yield db.Folder.create({name: 'Folder2'});
  var folder3 = yield db.Folder.create({name: 'Folder3'});
  var folder11 = yield db.Folder.create({name: 'Folder11'});
  yield library1.addFolder(folder1);
  yield library1.addFolder(folder2);
  yield library1.addFolder(folder3);
  yield library1.addFolder(folder11);
  yield folder1.addChildren(folder11);

  var media1 = yield db.Media.create({
    name: 'Media1',
    views: 10,
    description: 'Example Media1',
    links: 'fooo',
    file: '/tmp/thai.mp4'
  });
  var comment1 = yield db.Comment.create({
    text: 'Test comment 1',
    author: 'qwerty1',
    date: '20.09.2014'
  });
  var comment2 = yield db.Comment.create({
    text: 'Test comment 2',
    author: 'qwerty2',
    date: '22.09.2014'
  });
  var comment3 = yield db.Comment.create({
    text: 'Test answer on comment 2',
    author: 'qwerty2',
    date: '22.09.2014'
  });
  var comment4 = yield db.Comment.create({
    text: 'Test answer on comment 2',
    author: 'Demo user',
    date: '22.09.2014'
  });
  var comment5 = yield db.Comment.create({
    text: 'Test comment 3',
    author: 'qwerty2',
    date: '22.09.2014'
  });

  yield comment2.addChildren(comment3);
  yield comment2.addChildren(comment4);
  var media2 = yield db.Media.create({name: 'Media2', views: 17, description: 'Example Media2', links: 'bar'});
  var media3 = yield db.Media.create({name: 'Media3', views: 17});

  yield library1.addMedium(media1);
  yield media2.addComment(comment1);
  yield media3.addComment(comment2);
  yield media3.addComment(comment3);
  yield media3.addComment(comment4);
  yield media3.addComment(comment5);
  yield library1.addMedium(media2);
  yield folder11.addMedium(media3);
  yield library1.addMedium(media3);

  console.log('All debug done');

});