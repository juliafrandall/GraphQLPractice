(function () {
  'use strict';

  angular
    .module('foodLog')
    .controller('logFoodModalCtrl', logFoodModalCtrl);

  function logFoodModalCtrl(results, $modalInstance, $timeout) {

    //
    // VARIABLES
    //
    var vm = this;

    //
    // FUNCTIONS
    //

    vm.close = function () {
      $modalInstance.dismiss();
    };
    
    $timeout(function () {
      vm.close()
    }, 2400);
  }
})();
