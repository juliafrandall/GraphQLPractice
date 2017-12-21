(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountDeleteCtrl', AccountDeleteCtrl);

  function AccountDeleteCtrl($scope, user, nixTrackApiClient) {
    const vm = $scope.vm = this;

    vm.profile = user.getUserProfile();

    vm.resetEmailValidity = () => {
      vm.form.email.$setValidity('ownEmail', true);
    };

    vm.submit = () => {
      vm.submit.$success = null;
      vm.submit.$error   = null;

      if (vm.email === vm.profile.email) {
        nixTrackApiClient('/me/delete', {method: 'POST'})
          .then(response => vm.submit.$success = true)
          .catch(response => vm.submit.$error = response.data);
      } else {
        vm.form.email.$setValidity('ownEmail', false);
      }
    };
  }
})();
