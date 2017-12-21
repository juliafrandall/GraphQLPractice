(function () {
  'use strict';

  angular
    .module('account')
    .controller('LoginCtrl', LoginCtrl);


  function LoginCtrl($scope, Facebook, $q, user, nixTrackApiClient,
                     facebookLoginStatus, $sessionStorage, $filter, $location) {
    const vm = $scope.vm = this;

    vm.credentials = {
      email:    '',
      password: ''
    };

    $sessionStorage.ref = $location.search().ref || undefined;

    if (!$filter('isEmptyObject')($sessionStorage.oauth)) {
      if ($sessionStorage.oauth.client_id === 2) {
        vm.ref = 'amazonAlexa';
      }
    }

    if ($location.search().ref === 'caloriecount') {
      $sessionStorage.calorieCount = true;
      vm.ref                       = 'calorieCount';
    }

    vm.loginWithFacebook = function () {
      vm.loginWithFacebook.$error = null;

      $q(function (resolve, reject) {
        if (facebookLoginStatus && facebookLoginStatus.status === 'connected') {
          resolve(facebookLoginStatus);
        } else {
          Facebook.login(function (response) {
            if (response.status === 'connected') {
              resolve(response);
            } else {
              reject(response);
            }
          });
        }
      })
        .then(function (response) {
          return nixTrackApiClient('/oauth/facebook/signin', {
            method: 'POST',
            data:   {
              "access_token": response.authResponse.accessToken,
              "timezone":     user.getTimezone(),
              ref:            $sessionStorage.ref
            }
          })

        })
        .then(function (response) {
          $sessionStorage.ref = undefined;
          let identity        = response.data;
          user.setIdentity(identity);
        })
        .catch(function (response) {
          vm.loginWithFacebook.$error = response;
        });
    };

    vm.signIn = function () {
      vm.signIn.$error = null;

      nixTrackApiClient.auth.signin(vm.credentials)
        .success(function (data) {
          user.setIdentity(data);
        })
        .error(function (error) {
          if (error.message === 'There is no existing account that matches provided information') {
            error.type = 'ACCOUNT_DOES_NOT_EXIST';
          } else if (error.message === 'invalid credentials') {
            error.type = 'INVALID_PASSWORD';
          }

          vm.signIn.$error = error;
        })
    }
  }
})();

