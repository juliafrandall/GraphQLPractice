(function () {
  'use strict';

  angular
    .module('nutritionix')
    .controller('LandingCtrl', function ($state, $location, $sessionStorage) {
      let search = $location.search();

      if (search.ufl && search.s) {
        $sessionStorage.sharedFood = search;

        $state.go('account.cabinet.dashboard');
      }
    })
}());
