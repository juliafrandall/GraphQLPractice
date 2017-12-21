(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  angular
    .module(moduleName)
    .controller(`${moduleName}.SubscribeCtrl`, SubscribeCtrl);

  /* @ngInject */
  function SubscribeCtrl($scope, user, nixTrackApiClient, confirm) {
    const vm = $scope.vm = this;
    vm.user = user.getUserProfile();

    vm.accessCode = '';

    vm.submitAccessKey = () => {
      if (!vm.accessCode) {return false;}

      vm.submitAccessKey.$busy  = 1;
      vm.submitAccessKey.$error = null;

      return nixTrackApiClient('/iap/accessCode', {
        method: 'POST',
        data:   {
          access_code: vm.accessCode
        }
      })
        .then(() => {
          vm.user.premium_user = 1;
          user.setUserProfile(vm.user);
        })
        .catch(response => vm.submitAccessKey.$error = response.data)
        .finally(() => vm.submitAccessKey.$busy = null);
    };

    vm.unsubscribe = () => {
      return confirm('Are you sure you want to unsubscribe from Pro?')
        .then(() => nixTrackApiClient.me.preferences({premium_user: null}))
        .then(response => user.setUserProfile(angular.extend(vm.user, response.data)));
    }
  }
})();
