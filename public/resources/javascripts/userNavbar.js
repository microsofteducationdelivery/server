(function () {
  'use strict';

  var PageConstructor = WinJS.UI.Pages.define("/resources/pages/userNavbar.html", {
    ready: function (element, options) {
      // Data bind to the child tree to set the control text
      if (location.hash.search('#') !== -1 ) {
        WinJS.Navigation.navigate('resources/pages/password-recovery.html', {token: location.hash});
      } else {
        WinJS.Navigation.navigate('/resources/pages/getStarted.html');
      }
      WinJS.Utilities.query('a[href="/resources/pages/getStarted.html"]', element).addClass('b-main__link-active');
      WinJS.Binding.processAll(element, {
        user: WinJS.Application.sessionState.user
      });

      var arr = document.getElementsByClassName('main-navigation-link');
      arr[arr.length - 1].style.border = 'none';

      WinJS.Utilities.query('a', element).listen('click', function (event) {
        event.preventDefault();

        if (WinJS.Utilities.hasClass(event.target, 'b-main__link-active')) {
          return;
        }

        WinJS.Utilities.query('a', element).removeClass('b-main__link-active');
        WinJS.Utilities.addClass(event.target, 'b-main__link-active');

        WinJS.Navigation.navigate(event.target.href);
      });

      WinJS.Utilities.query('button.b-navigation-footer__logout', element).listen('click', function (event) {
        localStorage.removeItem('token');
        window.location = '/index.html';
      });

      WinJS.Utilities.query('mainLogo', element).listen('click', function (event) {
        event.preventDefault();
        WinJS.Navigation.navigate("index.html");
      });
    }
  });

  var mainLinks = [
    { page: '/resources/pages/getStarted.html', title: 'Get Started' },
    { page: '/resources/pages/useCases.html', title: 'Use Cases' },
    { page: '/resources/pages/openSource.html', title: 'Open Source' },
    { page: '/resources/pages/support.html', title: 'Support'}
  ];

  var mainNavLink = WinJS.Class.define(function (params) {
    this.page = params.page;
    this.title = params.title;
  });

  WinJS.Namespace.define('mainNavBar', {
    mainLinks: new WinJS.Binding.List(mainLinks.map(function (link) { return new mainNavLink(link); })),
    page: PageConstructor
  });
}());