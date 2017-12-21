(function () {
  'use strict';

  angular
    .module('account')
    .controller('ConnectedAppsCtrl', ConnectedAppsCtrl);

  function ConnectedAppsCtrl($scope, nixTrackApiClient, $window, confirm, $q) {
    var vm = $scope.vm = this;

    let loadMe = () => {
      return nixTrackApiClient.me().success(me => {
        vm.me = me;
        vm.toggles.sync();
      });
    };
    loadMe();

    vm.connect = function (providerName) {
      if (providerName === 'fitbit') {
        let loginWindow = window.open();

        nixTrackApiClient('/oauth/fitbit/sign', {
          method: 'POST',
          data:   {}
        }).success(state => {

          angular.element($window).one('message onmessage', function (event) {
            event = event.originalEvent;
            if (event.data === 'success') {
              event.source.close();

              loadMe();

              vm.messages.fitbit = {
                type:    'success',
                message: 'Your Fitbit account has been successfully linked.'
              };
            } else {
              vm.messages.fitbit = {
                type:    'danger',
                message: 'Your Fitbit account was not linked due to error.'
              };
            }
          });

          loginWindow.location = 'https://trackapi.nutritionix.com/v1/oauth/fitbit/authorize?state=' + state.state;
        })
      }
    };

    vm.messages = {
      fitbit: null,
      close:  providerName => {vm.messages[providerName] = null;}
    };

    vm.toggles = {
      fitbit: true,
      toggle: function (provider) {
        vm.toggleProvider(provider, this[provider]);
      },
      sync:   () => {
        ['fitbit'].forEach(providerName => {
          vm.toggles[providerName] = vm.getIsProviderActive(providerName);
        });
      }
    };


    vm.toggleProvider = function (providerName, state) {
      let provider = _.find(vm.me.oauths, {provider: providerName});

      if (providerName === 'fitbit') {
        if (provider) {
          if (!state) {
            return confirm('Are you sure you want to unlink your fitbit account?')
              .catch(rejection => {
                vm.toggles.fitbit = vm.getIsProviderActive('fitbit');
                return $q.reject(rejection);
              })
              .then(() => nixTrackApiClient('/oauth/fitbit/unlink'))
              .then(() => {
                loadMe();

                vm.messages.fitbit = {
                  type:    'success',
                  message: 'Your Fitbit account has been successfully unlinked.'
                };
              });
          }
        } else if (state) {
          vm.connect(providerName);
        }
      }
    };

    vm.getIsProviderActive = function (providerName) {
      if (vm.me) {
        let provider = _.find(vm.me.oauths, {provider: providerName});

        return !!(provider && provider.log_pref);
      }
    };
  }
})();
