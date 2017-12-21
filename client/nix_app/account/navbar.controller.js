(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountNavbarCtrl', AccountNavbarCtrl);


  function AccountNavbarCtrl($scope, user) {
    var vm = $scope.vm = this;

    vm.user = user;
    vm.navbarCollapsed = true;
  }
})();

