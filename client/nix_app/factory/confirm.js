(function (window, angular, undefined) {
  'use strict';

  var module = angular.module('confirm', ['ui.bootstrap']);

  module.service('confirm', function confirm($modal) {
    var template =
      `<div class="modal-header">
        <h3 class="modal-title">{{strings.title || "Confirm"}}</h3>
      </div>
      <div class="modal-body">{{strings.message || "Are you sure?"}}</div>
      <div class="modal-footer">
        <button nix-enter="ok()" nix-enter-global class="btn btn-danger" ng-click="ok()">
          {{strings.yes || "Yes"}}
        </button>
        <button class="btn btn-default" ng-click="cancel()">{{strings.no || "No"}}</button>
      </div>`;

    return function confirm(strings, modalOptions) {
      modalOptions = angular.extend({
        animation:  true,
        template:   template,
        controller: 'ConfirmController',
        size:       'md',
        resolve:    {
          strings: function () {
            if (angular.isString(strings)) {
              return {message: strings};
            }

            if (angular.isObject(strings)) {
              return strings;
            }

            return {};
          }
        }
      }, modalOptions || {});

      return $modal.open(modalOptions).result;
    };
  });

  module.controller('ConfirmController', function ($scope, $modalInstance, strings) {
    $scope.strings = strings || {};

    $scope.ok = function () {
      $modalInstance.close($scope.comment);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });

  module.directive('nixEnter', function ($window) {
    return function (scope, element, attrs) {
      let target;

      if (angular.isUndefined(attrs.nixEnterGlobal)) {
        target = element;
      } else {
        target = angular.element($window);
      }

      let handler = function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.nixEnter, {$event: event});
          });

          event.preventDefault();
        }
      };

      target.on("keydown keypress", handler);

      element.on('$destroy', function () {
        target.off("keydown keypress", handler);
      });
    };
  });
})(window, window.angular);
