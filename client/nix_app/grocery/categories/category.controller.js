(function () {
  'use strict';

  angular
    .module('category')
    .controller('categoryCtrl', categoryCtrl);

  function categoryCtrl(results, $stateParams, ServicesFactory) {

    //
    // VARIABLES
    //
    var vm = this;


    //
    //Function
    //
    vm.categories = results.data[0];

    vm.cleanUrl = function (string) {
      return ServicesFactory.cleanUrl(string);
    }

  }
})();
