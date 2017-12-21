(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountCreateStep1Ctrl', AccountCreateStep1Ctrl);


  function AccountCreateStep1Ctrl($scope, $state, nixTrackApiClient,
                                  user, moment, $location, $sessionStorage,
                                  confirm, $filter) {
    const vm = $scope.vm = this;

    vm.confirm = {
      track:    false
    };

    vm.signup = {
      first_name: $state.params.first_name || '',
      email:      '',
      password:   '',
      timezone:   moment.tz.guess() || "US/Eastern",
      ref:        $location.search().ref || $sessionStorage.ref || undefined
    };

    vm.coachAccessCode = $state.params.ac;

    vm.createAccount = function () {
      vm.createAccount.$error = null;

      if (vm.form && vm.form.$invalid) {return false;}

      nixTrackApiClient('/auth/signup', {
        method: 'POST',
        data:   _.pick(vm.signup, ['first_name', 'email', 'password', 'timezone', 'ref'])
      })
        .then(response => response.data)
        .then(function (data) {
          data.user.firstLogin = true;
          user.setIdentity(data);

          $sessionStorage.ref = undefined;

          if (vm.coachAccessCode) {
            return nixTrackApiClient('/iap/accessCode', {
              method: 'POST',
              data:   {
                access_code: vm.coachAccessCode
              }
            })
              .then(response => {
                const coach = response.data.coach;

                user.setUserProfile({premium_user: 1});

                return confirm('Do you want to grant access to ' + $filter('name')(coach))
                  .catch(() => nixTrackApiClient('/share/coaches', {
                    method: 'DELETE',
                    data:   {coach_code: coach.code}
                  }))
              })
              .catch(() => null)
          }
        })
        .then(() => {
          $state.go('account.auth.create.step2');
        })
        .catch(function (response) {
          let error = vm.createAccount.$error = response.data;
          error.code = error.message.indexOf('account already exists') > -1 ? 409 : response.code;
        })
    }
  }
})();

