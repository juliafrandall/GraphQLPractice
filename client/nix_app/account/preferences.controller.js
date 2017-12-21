(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountPreferencesCtrl', AccountPreferencesCtrl);

  function AccountPreferencesCtrl($scope, user, nixTrackApiClient) {
    const vm = $scope.vm = this;

    vm.primaryNutrients = {
      208: 'Calories',
      205: 'Carb',
      307: 'Sodium',
      203: 'Protein'
    };

    vm.me = user.getIdentity().user;

    nixTrackApiClient.me()
      .success(profile => {user.setUserProfile(profile);})
  }
})();
