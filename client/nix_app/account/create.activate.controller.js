(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountCreateActivateCtrl', AccountCreateActivateCtrl);


  function AccountCreateActivateCtrl($scope, $state) {
    var vm = $scope.vm = this;

    vm.email = $state.params.email;
  }
})();

