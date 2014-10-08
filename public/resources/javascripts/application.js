function initialize() {
  var user = localStorage.getItem('user'),
      token = localStorage.getItem('token');

  if (token === 'undefined') {
      token = '';
  }
  if (user === 'undefined') {
    user = '';
  } else {
    user = JSON.parse(user);
  }
  if ((!user || !token ) && window.location.pathname !== '/index.html') {
      window.location = '/index.html';
  }
  if (user && token && window.location.pathname === '/index.html') {
      window.location = '/admin.html';
  }

    window.populateCacheHtml = function  (state, href, text) {
        // Because we later use "setInnerHTMLUnsafe" ("Unsafe" is the magic word here), we
        // want to force the href to only support local package content when running
        // in the local context. When running in the web context, this will be a no-op.
        //
        href = WinJS.UI.Fragments._forceLocal(href);

        var fragment = document.createDocumentFragment();
        var htmlDoc = document.implementation.createHTMLDocument("frag");


        var base = htmlDoc.createElement("base");
        htmlDoc.head.appendChild(base);
        var anchor = htmlDoc.createElement("a");
        htmlDoc.body.appendChild(anchor);
        base.href = document.location.href; // Initialize base URL to primary document URL
        anchor.setAttribute("href", href); // Resolve the relative path to an absolute path
        base.href = anchor.href; // Update the base URL to be the resolved absolute path
        // 'anchor' is no longer needed at this point and will be removed by the innerHTML call
        state.document = htmlDoc;
        WinJS.Utilities.setInnerHTMLUnsafe(htmlDoc.documentElement, text);
        htmlDoc.head.appendChild(base);

        while (htmlDoc.body.childNodes.length > 0) {
            fragment.appendChild(htmlDoc.body.childNodes[0]);
        }

        state.docfrag = fragment;
        return fragment;
    };

  WinJS.Application.sessionState.user = user;
  WinJS.Application.sessionState.token = localStorage.getItem('token');

  /*window.authXHR = function (options) {
    options.headers = options.headers || {};
    options.responseType = options.responseType || 'text';
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    if (WinJS.Application.sessionState.token) {
      options.headers.Authorization = 'Bearer ' + WinJS.Application.sessionState.token;
    }
    return WinJS.xhr(options);
  };*/

   WinJS.UI.processAll();
}

document.addEventListener('DOMContentLoaded', initialize(), false);
