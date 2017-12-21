angular
  .module('diets')
  .controller('DietsCtrl', function DietsCtrl($scope, diets) {
    const vm = $scope.vm = this;

    vm.diets = diets;
  });
