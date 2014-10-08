(function () {
  'use strict';

  var PageConstructor = WinJS.UI.Pages.define("/resources/pages/navbar.html", {
    ready: function (element, options) {
      var libHref = WinJS.Utilities.query('a[href="/resources/pages/libraries.html"]', element)
      WinJS.Navigation.navigate(libHref[0].href);
      libHref.addClass('b-navigation__link-active');

      // Data bind to the child tree to set the control text
      WinJS.Binding.processAll(element, {
        user: WinJS.Application.sessionState.user
      });
      WinJS.Utilities.query('a', element).listen('click', function (event) {
        event.preventDefault();

        if (WinJS.Utilities.hasClass(event.target, 'b-navigation__link-active')
            && WinJS.Navigation.location === event.target.href) {
          return;
        }

        WinJS.Utilities.query('a', element).removeClass('b-navigation__link-active');
        WinJS.Utilities.addClass(event.target, 'b-navigation__link-active');
        WinJS.Navigation.navigate(event.target.href);

      });

      WinJS.Utilities.query('button.b-navigation-footer__logout', element).listen('click', function (event) {
        localStorage.removeItem('token');
        window.location = '/index.html';
      });
    }
  });
    var links;

    var user = localStorage.getItem('user');
    if (user === 'undefined') {
        user = {};
    } else {
        user = JSON.parse(user);
    }
    if (user.type !== 'admin') {
        links = [
            { page: '/resources/pages/libraries.html', title: 'Libraries' },
            { page: '/resources/pages/commentaries.html', title: 'Commentaries' },
            { page: '/resources/pages/statistics.html', title: 'Statistics'}
        ];
    } else {
        links = [
            { page: '/resources/pages/libraries.html', title: 'Libraries' },
            { page: '/resources/pages/users.html', title: 'Users' },
            { page: '/resources/pages/commentaries.html', title: 'Commentaries' },
            { page: '/resources/pages/motd.html', title: 'Message of the Day'},
            { page: '/resources/pages/statistics.html', title: 'Statistics'}
        ];
    }


  var NavLink = WinJS.Class.define(function (params) {
    this.page = params.page;
    this.title = params.title;
  });

  WinJS.Namespace.define('NavBar', {
    links: new WinJS.Binding.List(links.map(function (link) { return new NavLink(link); })),
    page: PageConstructor
  });
}());