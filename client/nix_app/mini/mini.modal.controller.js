(function () {
  'use strict';

  angular
    .module('mini')
    .controller('miniModalCtrl', miniModalCtrl);

  function miniModalCtrl(results, $modalInstance, $timeout) {

    //
    // VARIABLES
    //
    var vm = this;

    //
    // FUNCTIONS
    //

    vm.close = function () {
      vm.response = results.data[0];
      $modalInstance.close();
    }

    $timeout(function () {
      vm.close()
    }, 2400);
  }
})();
