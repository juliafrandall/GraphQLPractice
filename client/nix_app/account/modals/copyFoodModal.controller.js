(function () {
  'use strict';

  angular
    .module('account')
    .controller('copyFoodModalCtrl', copyFoodModalCtrl);

  function copyFoodModalCtrl($scope, $modalInstance, moment, nixTrackApiClient, food) {
    var vm = $scope.vm = this;

    vm.food = food;

    vm.date = moment().startOf('hour');

    vm.close = () => {$modalInstance.dismiss();};

    vm.copy = () => {
      nixTrackApiClient.log.copy(food, moment(vm.date).format())
        .then(() => {$modalInstance.close();});
    }

  }
})();
