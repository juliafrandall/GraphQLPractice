angular
  .module('diets')
  .controller('DietDetailCtrl', function DietDetailCtrl($scope, diet) {
    const vm = $scope.vm = this;

    vm.diet = diet;
  });
