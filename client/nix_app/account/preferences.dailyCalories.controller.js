(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountPreferencesDailyCaloriesCtrl', AccountPreferencesDailyCaloriesCtrl);

  function AccountPreferencesDailyCaloriesCtrl($scope, $state) {
    var vm = $scope.vm = this;

    vm.backButtonUrl = $state.href('account.cabinet.preferences');

  }
})();
