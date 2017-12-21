(function (window, document, angular, undefined) {
  'use strict';
  angular.module('angular-snap-engage', [])
    .provider('SnapEngage', function () {
      var account,
          created = false;

      /**
       * Configuration Methods
       **/

      this.setAccount = function (id) {
        account = id;
        return this;
      };

      /**
       * Public Service
       */
      this.$get = ['$log', '$q', '$rootScope', function ($log, $q, $rootScope) {
        var ready   = $q.defer(),
            service = {};

        this._log = function () {
          if (arguments.length > 0) {
            if (arguments.length > 1) {
              switch (arguments[0]) {
              case 'warn':
                $log.warn(Array.prototype.slice.call(arguments, 1));
                break;
              case 'error':
                $log.error(Array.prototype.slice.call(arguments, 1));
                break;
              }
            }
            this.log.push(Array.prototype.slice.call(arguments));
          }
        };

        this._createScriptTag = function () {
          if (!account) {
            this._log('warn', 'No account id set to create script tag');
            return;
          }

          if (created === true) {
            this._log('warn', 'SnapEngage script tag already created');
            return;
          }

          (function () {
            var se = document.createElement('script');
            se.type = 'text/javascript';
            se.async = true;
            se.src = '//storage.googleapis.com/code.snapengage.com/js/' + account + '.js';
            var done = false;
            se.onload = se.onreadystatechange = function () {
              if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                done = true;
                /* Place your SnapEngage JS API code below */
                /* SnapEngage.allowChatSound(true); Example JS API: Enable sounds for Visitors. */
                window.SnapEngage.hideButton();
                window.SnapEngage.allowProactiveChat(false);
                service.service = window.SnapEngage;
                ready.resolve();
              }
            };
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(se, s);
          })();

          created = true;
          return true;
        };


        this._createScriptTag();

        service.account = account;
        service.ready = ready.promise;

        $rootScope.$on('$stateChangeStart', function () {
          service.ready.then(function () {
            service.service.hideButton();
            service.service.allowProactiveChat(false);
          });
        });

        return service;
      }];
    })

    .directive('snapEngageButton', ['SnapEngage', '$window', function (SnapEngage, $window) {
      return {
        restrict: 'AE',
        replace:  true,
        template: '<a href>' +
                    '<img src="https://www.snapengage.com/statusImage?w={{account}}" alt="{{alt}}" border="0">' +
                  '</a>',
        link:     function (scope, element, attrs) {
          scope.account = SnapEngage.account;
          scope.alt = attrs.alt || 'Contact us';

          element.bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            SnapEngage.ready.then(function () {
              SnapEngage.service.startLink();
            });

            return false;
          });
        }
      };
    }])
    .directive('snapEngage', ['SnapEngage', '$window', function (SnapEngage, $window) {
      return {
        link: function (/* scope, element, attrs */) {
          SnapEngage.ready.then(function () {
            SnapEngage.service.showButton();
            SnapEngage.service.allowProactiveChat(true);
          });
        }
      };
    }]);
})(window, document, window.angular);
