(function () {
  'use strict';

  angular
    .module('dailyCalories')
    .controller('dailyCaloriesCtrl', dailyCaloriesCtrl);

  function dailyCaloriesCtrl($scope, $location) {
    let vm = $scope.vm = this;

    vm.preset = $location.search().preset;

    $scope.$watch('vm.preset', preset => {$location.search('preset', preset)});

  }
})();
