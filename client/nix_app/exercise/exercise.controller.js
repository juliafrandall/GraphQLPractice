(function () {
  'use strict';

  angular
    .module('exercise')
    .controller('ExerciseCtrl', ExerciseCtrl);

  function ExerciseCtrl($scope, exercise, $state) {
    const vm = $scope.vm = this;

    if (!exercise) {
      $state.go('site.404');
      return;
    }

    vm.exercise = exercise;
  }
})();
