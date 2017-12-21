(function () {
  'use strict';

  angular
    .module('account')
    .controller('dailyCaloriesModalCtrl', dailyCaloriesModalCtrl);

  function dailyCaloriesModalCtrl($scope, $modalInstance) {
    var vm = $scope.vm = this;

    vm.close = () => {
      $modalInstance.close(vm.userDailyCalories);
    };

    vm.dismiss = () => {
      $modalInstance.dismiss();
    };

  }
})();
