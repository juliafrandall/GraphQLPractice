(function (window, document, angular, undefined) {
  'use strict';
  angular.module('angular-wufoo-forms', [])
    .provider('WufooForms', function () {
      let created;

      /**
       * Public Service
       */
      this.$get = ['$q', '$log', function ($q, $log) {
        var ready   = $q.defer(),
            service = {};

        this._createScriptTag = function () {
          if (created === true) {
            $log.warn('Wufoo Forms script tag already created');
            return;
          }

          (function () {
            var se = document.createElement('script');
            se.type = 'text/javascript';
            se.async = true;
            se.src = '//www.wufoo.com/scripts/embed/form.js';
            var done = false;
            se.onload = se.onreadystatechange = function () {
              if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                done = true;
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

        service.ready = ready.promise;

        return service;
      }];
    })

    .directive('wufooForm', ['WufooForms', '$log', '$timeout', function (WufooForms, $log, $timeout) {
      return {
        restrict: 'A',
        replace:  true,
        template: `<div id="wufoo-{{id}}">
                    Fill out my <a ng-href="https://nutritionix.wufoo.com/forms/{{id}}">online form</a>.
                  </div>`,
        scope:    {
          id:      '=wufooForm',
          options: '=?'
        },
        link:     function (scope/*, element, attrs*/) {
          let options = angular.merge({
            'userName':   'nutritionix',
            'formHash':   scope.id,
            'autoResize': true,
            'height':     '938',
            'async':      true,
            'host':       'wufoo.com',
            'header':     'show',
            'ssl':        true
          }, scope.options || {});

          $timeout(() => {
            WufooForms.ready.then(function () {
              try {
                let form = new WufooForm();
                form.initialize(options);
                form.display();
              } catch (e) {
                $log.error(`Form could not be created: ${e.message}`);
              }
            });
          });
        }
      };
    }]);
})(window, document, window.angular);
