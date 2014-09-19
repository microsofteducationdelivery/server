/**
 * Created by kanuny on 11.09.14.
 */
(function () {
    'use strict';
    var controlClass = WinJS.Class.define(
        function Control_ctor (element, options) {
            WinJS.Utilities.query('a', element).listen('click', function (event) {

                event.preventDefault();

                WinJS.Utilities.query('[id=container]')[0].scrollTop = 0;

                var currActiveHref = WinJS.Utilities.query('a[class="main-navigation-link b-main__link-active"]'),
                    hrefs = WinJS.Utilities.query('a[class=main-navigation-link]'),
                    currHref
                ;

                if (currActiveHref[0].href === event.target.href) {
                    return;
                }
                for (var i = 0; i < hrefs.length; i ++) {
                    if (hrefs[i].href === event.target.href) {
                        currHref = hrefs[i];
                        break;
                    }
                }
                currActiveHref.removeClass('b-main__link-active');
                currHref.className += ' b-main__link-active';
                WinJS.Navigation.navigate(event.target.href);

            });
        }
    );
    WinJS.Namespace.define("Footer.UI", {
        Nav: controlClass
    });

    WinJS.UI.processAll();
})();