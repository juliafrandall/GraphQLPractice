(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  angular
    .module(moduleName)
    .controller(`${moduleName}.EnableSharingCtrl`, EnableSharingCtrl);

  /* @ngInject */
  function EnableSharingCtrl($scope, $state, nixTrackApiClient, user, confirm, $q, $localStorage) {
    const vm = $scope.vm = this;

    vm.user = user.getUserProfile();

    vm.coachId = $localStorage.coachId || '';

    vm.submitCoach = () => {
      vm.submitCoach.$success = vm.submitCoach.$error = vm.submitCoach.$coach = null;

      let coachId = (vm.coachId || '').replace('-', '');

      if (coachId && coachId.length === 6) {
        vm.submitCoach.$busy    = true;
        nixTrackApiClient('/share/coaches', {
          method: 'POST',
          data:   {coach_code: coachId}
        })
          .then(response => {
            vm.loadCoaches();
            vm.submitCoach.$success = true;
            $localStorage.coachId   = undefined;
            return response.data;
          })
          .catch(response => {
            if (response.status === 400) {
              vm.submitCoach.$error = {message: 'No coach found'};
              return $q.reject(response);
            } else if (response.status === 402) {
              $localStorage.coachId = vm.coachId;
              return response.data;
            }
          })
          .then(coach => {
            coach.name            = `${coach.first_name || ''} ${coach.last_name || ''}`.trim();
            vm.submitCoach.$coach = coach;
          })
          .finally(() => {
            vm.submitCoach.$busy = false;
          })
      }
    };

    if (vm.coachId) {
      vm.submitCoach();
    }

    vm.removeCoach = coach => {
      confirm("Are you sure you'd like to delete this coach?")
        .then(() => vm.coaches = _.without(vm.coaches, coach))
        .then(() => nixTrackApiClient('/share/coaches', {
          method: 'DELETE',
          data:   {coach_code: coach.code}
        }));
    };

    vm.becomeCoach = () => {
      nixTrackApiClient('/me/coach', {method: 'POST'})
        .then(() => nixTrackApiClient.me())
        .then(response => {
          user.setUserProfile(angular.extend(vm.user, response.data));
          $state.go('account.cabinet.coach-portal.dashboard');
        })
    };

    vm.stopCoaching = () => confirm('Are you sure you want to stop being a coach')
      .then(() => nixTrackApiClient('/me/coach', {method: 'DELETE'}))
      .then(() => {
        user.setUserProfile(angular.extend(vm.user, {coach: null}));
      });

    vm.loadCoaches = () => {
      nixTrackApiClient('/share/coaches')
        .then(response => {
          vm.coaches = response.data.coaches;
          vm.coaches.forEach(coach => {
            coach.name = `${coach.first_name || ''} ${coach.last_name || ''}`.trim();
          })
        })
    };

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
          vm.loadCoaches();

          vm.accessCode = vm.coachId = $localStorage.coachId = '';
        })
        .catch(response => vm.submitAccessKey.$error = response.data)
        .finally(() => vm.submitAccessKey.$busy = null);
    };

    if (vm.user.premium_user) {
      vm.loadCoaches();
    }
  }
})();
