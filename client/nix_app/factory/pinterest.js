(function () {
  'use strict';

  angular.module('nutritionix.pinterest', [])
    .provider('pinterest', function () {
      let created = false;

      /**
       * Public Service
       */
      this.$get = function ($q, $timeout, $window) {
        let ready   = $q.defer(),
            service = {};

        this._createScriptTag = function () {
          if (created === true) { return; }

          (function () {
            let se               = document.createElement('script');
            se.type              = 'text/javascript';
            se.async             = true;
            se.defer             = true;
            se.src               = '//assets.pinterest.com/js/pinit.js';
            se['data-pin-build'] = 'parsePins';
            let done             = false;
            se.onload            = se.onreadystatechange = function () {
              if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                (function waitForParsePins() {
                  if ($window.parsePins) {
                    done = true;
                    service.parsePins = $window.parsePins;
                    ready.resolve();
                  } else {
                    $timeout(waitForParsePins, 50)
                  }
                }());
              }
            };
            let s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(se, s);
          })();

          created = true;
          return true;
        };


        this._createScriptTag();

        service.ready = ready.promise;

        return service;
      };
    })
    .directive('pinIt', function (pinterest) {
      return {
        link: function (scope, element, attributes) {
          pinterest.ready.then(() => {
            element.attr('href', 'https://www.pinterest.com/pin/create/button/');

            if (element.children().length) {
              element.attr('data-pin-custom', 'true');
              element.css('cursor', 'pointer');
            }

            pinterest.parsePins(element.closest()[0]);
          });
        }
      };
    });
}());
