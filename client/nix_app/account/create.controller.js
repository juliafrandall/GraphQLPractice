(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountCreateCtrl', AccountCreateCtrl);


  function AccountCreateCtrl($scope, $http, $log, $state) {
    var vm = $scope.vm = this;
  }
})();

