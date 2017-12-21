(function () {
  'use strict';

  angular
    .module('restaurantPlatform')
    .controller('restaurantPlatformCtrl', restaurantPlatformCtrl);

  function restaurantPlatformCtrl($scope, $anchorScroll, RestaurantPlatformFactory, Analytics, vcRecaptchaService) {

    //
    // VARIABLES
    //

    var vm = this;
    vm.errorMessage = "";
    vm.message = {};
    vm.successMessage = '';
    vm.errorMessage = '';

    vm.recaptcha = {
      response: null,
      widgetId: null
    };

    vm.sendMessage = function () {
      Analytics.trackEvent('button', 'click', 'send message');

      if (!$scope.form) { return; }

      if ($scope.form.$valid) {
        vm.closeAlertMessage();
        vm.closeSuccessAlertMessage();

        vm.message.recaptcha = vm.recaptcha.response;

        RestaurantPlatformFactory
          .sendEmail(vm.message)
          .then(function () {
            vm.message = {};
            vm.successMessage = "We'll be in contact shortly!";
            vm.errorMessage = "";

            $scope.form.$setPristine();
          })
          .catch(function (response) {
            if (angular.isString(response.data)) {
              vm.errorMessage = response.data;
            } else if (angular.isObject(response.data) && response.data.message) {
              vm.errorMessage = response.data.message;
            } else {
              vm.errorMessage = 'Unexpected backend error';
            }
          })
          .finally(() => {
            vcRecaptchaService.reload(vm.recaptcha.widgetId);
          })
      } else {
        angular.forEach($scope.form, function (property, key) {
          if (key[0] !== '$' && property.$invalid) {
            property.$setDirty();
          }
        });
      }
    };

    vm.closeAlertMessage = function () {
      vm.errorMessage = "";
    };

    vm.closeSuccessAlertMessage = function () {
      vm.successMessage = "";
    };

    vm.jumpToForm = function () {
      $anchorScroll('restaurantPlatform');
      angular.element('#username').focus();
    };
  }
})();
