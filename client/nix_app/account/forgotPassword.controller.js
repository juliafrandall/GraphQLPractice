(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountForgotPasswordCtrl', AccountForgotPasswordCtrl);

  function AccountForgotPasswordCtrl($scope, nixTrackApiClient, $stateParams) {
    var vm = $scope.vm = this;

    vm.email = $stateParams.email || null;

    vm.requestPasswordReset = function () {
      vm.requestPasswordReset.$success = null;
      vm.requestPasswordReset.$error = null;

      if ($scope.form && $scope.form.$valid) {
        nixTrackApiClient.auth.updatePassword.request(vm.email)
          .success(() => { vm.requestPasswordReset.$success = true;})
          .error((error) => { vm.requestPasswordReset.$error = error;});
      }
    };
  }
})();
