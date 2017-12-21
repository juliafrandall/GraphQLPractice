(function () {
  'use strict';

  angular
    .module('account')
    .controller('calendarModalCtrl', calendarModalCtrl);

  function calendarModalCtrl($scope, $modal, ServicesFactory, $modalInstance) {
    var vm = $scope.vm = this;
  
    vm.today = function() {
      vm.dt = new Date();
    };
    vm.today();

    vm.inlineOptions = {
      minDate: new Date(),
      showWeeks: false
    };

    vm.close = function () {
      $modalInstance.dismiss();
    };

  }
})();
