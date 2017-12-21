(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountResetPasswordCtrl', AccountResetPasswordCtrl);

  function AccountResetPasswordCtrl($scope, $state, nixTrackApiClient) {
    var vm = $scope.vm = this;

    vm.password = null;
    vm.passwordRepeat = null;

    vm.resetPassword = function () {
      if ($scope.form && $scope.form.$valid) {
        let options = {
          "link_hash": $state.params.key,
          "password":  vm.password
        };

        nixTrackApiClient.auth.updatePassword.set(options)
          .success(() => { vm.resetPassword.$success = true;})
          .error((error) => { vm.resetPassword.$error = error;});
      }
    };
  }
})();


