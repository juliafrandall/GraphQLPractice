(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountHelpCtrl', AccountHelpCtrl);

  function AccountHelpCtrl($scope, user) {
    const vm = $scope.vm = this;

    vm.user = user.getUserProfile();
  }
})();
