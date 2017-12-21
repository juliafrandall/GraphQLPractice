(function () {
  'use strict';

  angular
    .module('account')
    .controller('addWaterModalCtrl', addWaterModalCtrl);

  function addWaterModalCtrl($rootScope, $scope, $modalInstance, parentVm, nixTrackApiClient, user, units, $filter) {
    const vm = $scope.vm = this;
    const date = parentVm.viewDate.format(parentVm.dateFormat);

    vm.isMetric = user.get('measure_system');
    vm.unit     = vm.isMetric ? 'L' : 'oz';
    vm.volumes  = vm.isMetric ? ['0.25', '0.33', '0.5', '1'] : ['8', '16', '24', '32'];

    vm.totalValue = $filter('volume')(parentVm.water || 0);

    vm.submit = (consumed, update = false) => {
      vm.$busy = true;
      nixTrackApiClient('/water/log' + (update ? '' : '/add'), {
        method: update ? 'PUT' : 'POST',
        data:   {
          logs: [{
            date,
            consumed: vm.isMetric ? consumed : units.oz.toLitres(consumed)
          }]
        }
      })
        .then(response => {
          vm.totalValue = $filter('volume')(response.data.logs[0].consumed || 0);
          $rootScope.$broadcast('track:water-updated');
          $modalInstance.close();
        })
        .finally(() => {
          vm.$busy = false;
        })
    };
    vm.close = () => {$modalInstance.dismiss();};

  }
})();
