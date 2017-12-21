(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountMessagesCtrl', AccountMessagesCtrl);

  function AccountMessagesCtrl($scope, messages) {
    var vm = $scope.vm = this;

    vm.messages = messages;
  }
})();
