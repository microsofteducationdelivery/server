var
  db = require('./db'),
  co = require('co'),
  bcrypt = require('bcrypt-nodejs')
;

module.exports = co(function* () {
  yield db.client.query('SET FOREIGN_KEY_CHECKS = 0');
  yield db.client.sync({ force: true });
  yield db.client.query('SET FOREIGN_KEY_CHECKS = 1');

  var company = yield db.Company.create({
    name: 'Test'
  });

  var user = db.User.build({
    name: 'Demo user',
    login: 'demo',
    email: 'demo@demo.me',
    password: bcrypt.hashSync('demo'),
    type: 'owner'
  });

  var user2 = db.User.build({
    name: 'Demo user2',
    login: 'demo2',
    email: 'demo2@demo.me',
    password: bcrypt.hashSync('demo2'),
    type: 'operator'
  });

  var user3 = db.User.build({
    name: 'Demo user3',
    login: 'demo3',
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
    picture: '/resources/preview/4002.png'
  });
  var media2 = yield db.Media.create({name: 'Media2', views: 17, description: 'Example Media2', links: 'bar'});
  var media3 = yield db.Media.create({name: 'Media3', views: 17});

  yield library1.addMedium(media1);
  yield library1.addMedium(media2);
  yield folder11.addMedium(media3);
  yield library1.addMedium(media3);

  console.log('All debug done');

});