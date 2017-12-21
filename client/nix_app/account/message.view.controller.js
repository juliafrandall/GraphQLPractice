(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountViewMessageCtrl', AccountViewMessageCtrl);

  function AccountViewMessageCtrl($scope, $state, messages) {
    var vm = $scope.vm = this;

    messages.getMessage($state.params.id, true).then(message => {
      vm.message = message;
    });

    vm.archive = () => {
      messages.archiveMessage(vm.message)
        .then(() => {
          $state.go('account.cabinet.messages');
        });
    }
  }
})();
