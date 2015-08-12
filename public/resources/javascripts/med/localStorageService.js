(function() {
  var key = 'MED';
  function getUser() {
    return localStorage.getItem(key + 'user');
  }

  function getToken() {
    return localStorage.getItem(key + 'token');
  }

  function setToken(token) {
    localStorage.setItem(key + 'token', token);
  }

  function setUser(data) {
    localStorage.setItem(key + 'user', JSON.stringify(data));
  }

  function deleteToken() {
    localStorage.removeItem(key + 'token');
  }

  WinJS.Namespace.define('MED.Storage', {
    getUser: getUser,
    getToken: getToken,
    setToken: setToken,
    setUser: setUser,
    deleteToken: deleteToken
  });

})();
