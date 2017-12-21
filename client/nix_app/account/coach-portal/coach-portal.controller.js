(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  angular
    .module(moduleName)
    .controller(`${moduleName}.CoachPortalCtrl`, CoachPortalCtrl);

  /* @ngInject */
  function CoachPortalCtrl($scope, user, nixTrackApiClient) {
    const vm = $scope.vm = this;
    vm.user = user.getUserProfile();

    vm.search = '';

    nixTrackApiClient('/share/patients')
      .then(response => {
        vm.patients = _.values(response.data.patients);
        vm.patients.forEach(p => {
          p.name = [p.last_name, p.first_name].filter(v => !!((v || '').trim())).join(', ').trim();
        })
      })

  }
})();
