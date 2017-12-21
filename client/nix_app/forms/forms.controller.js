(function () {
  'use strict';

  angular
    .module('nutritionix.forms')
    .controller('formsCtrl', formsCtrl);

  function formsCtrl($state, title) {
    var vm = this;

    vm.title = title;
    vm.id = $state.params.id;
  }

})();
