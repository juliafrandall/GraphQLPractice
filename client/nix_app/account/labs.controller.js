(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountLabsCtrl', AccountLabsCtrl);

  function AccountLabsCtrl($scope, moment, user) {
    const vm = $scope.vm = this;

    vm.user = user.getUserProfile();

    vm.reportBoundaries = {
      begin: moment().subtract(7, 'day').format('YYYY-MM-DD'),
      end:   moment().subtract(1, 'day').format('YYYY-MM-DD')
    }
  }
})();
