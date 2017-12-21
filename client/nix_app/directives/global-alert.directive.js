(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('globalAlert', function ($timeout) {
      return {
        message:      null,
        bindings:     null,
        type:         'success',
        dismissAfter: null,
        visible:      false,
        success:      function (message, dismissAfter, bindings) {
          if (!dismissAfter && dismissAfter !== 0) {
            dismissAfter = 5000;
          }
          this.show(message, 'success', dismissAfter, bindings)
        },
        info:         function (message, dismissAfter, bindings) {
          if (!dismissAfter && dismissAfter !== 0) {
            dismissAfter = 5000;
          }
          this.show(message, 'info', dismissAfter, bindings)
        },
        warning:      function (message, dismissAfter, bindings) {
          this.show(message, 'warning', dismissAfter, bindings)
        },
        danger:       function (message, dismissAfter, bindings) {
          this.show(message, 'danger', dismissAfter, bindings)
        },
        dismiss:      function () {
          this.visible      = false;
          this.message      = null;
          this.type         = null;
          this.dismissAfter = null;
          this.bindings     = {};
        },
        show:         function (message, type, dismissAfter, bindings) {
          this.dismiss();

          $timeout(() => {
            this.visible      = message;
            this.message      = message;
            this.type         = type || 'success';
            this.dismissAfter = dismissAfter || null;
            this.bindings     = bindings || {};
          }, 100);

          if (dismissAfter) {
            $timeout(() => {
              if (this.message === message) {
                this.dismiss();
              }
            }, dismissAfter + 100);
          }
        }
      }
    })
    .directive('globalAlert', function (globalAlert) {
      return {
        template: `
          <div class="alert-wrap" ng-if="alert.visible" ng-style="{top: alert.bindings.css.top || undefined}">
            <div class="alert alert-sitewide" 
              ng-class="'alert-' + alert.type" 
              compile="alert.message">
            </div>
          </div>
        `,
        link:     function (scope, elm, attrs) {
          scope.alert = globalAlert;
        }
      };
    })
    .directive('compile', ['$compile', function ($compile) {
      return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
            // watch the 'compile' expression for changes
            return scope.$eval(attrs.compile);
          },
          function (value) {
            // when the 'compile' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
      };
    }]);
}());
