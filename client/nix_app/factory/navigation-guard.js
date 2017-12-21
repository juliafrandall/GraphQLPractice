'use strict';

angular.module('nutritionix')
  .factory('navigationGuard', function ($injector, $window, $rootScope) {
      let conditions        = [];
      const navigationGuard = {
        watch:   function (condition, message) {
          conditions.push({
            condition: condition,
            message:   message || 'Are you sure?'
          });

          return conditions.length - 1;
        },
        unwatch: function (index) {
          conditions.splice(index, 1);
        },
        release: function () {
          conditions = [];
        },
        check:   function () {
          for (let i = 0; i < conditions.length; i += 1) {
            if (!conditions[i].condition()) {
              return conditions[i].message;
            }
          }

          return true;
        }
      };

      angular.element($window).on('beforeunload', function beforeunload(event) {
        for (let i = 0; i < conditions.length; i += 1) {
          if (!conditions[i].condition()) {
            (event || $window.event).returnValue = conditions[i].message;
            return conditions[i].message;
          }
        }

        return void 0;
      });

      if ($injector.has('$state')) {
        $rootScope.$on('$stateChangeStart', function stateChangeStart(event) {
          for (let i = 0; i < conditions.length; i += 1) {
            if (!conditions[i].condition() && !$window.confirm(conditions[i].message)) {
              event.preventDefault();
              return false;
            }
          }
        });

        $rootScope.$on('$stateChangeSuccess', function stateChangeSuccess() {
          navigationGuard.release();
        });
      }


      return navigationGuard;
    }
  );
