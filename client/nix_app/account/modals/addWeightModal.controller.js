(function () {
  'use strict';

  angular
    .module('account')
    .controller('addWeightModalCtrl', addWeightModalCtrl);

  function addWeightModalCtrl($rootScope, $scope, $modalInstance, user,
                              moment, nixTrackApiClient, date, weight, confirm,
                              defaultWeightKg, $timeout) {
    const vm = $scope.vm = this;

    vm.edit = weight;

    vm.measureSystem = user.get('measure_system');

    vm.unit              = vm.measureSystem ? 'kg' : 'lb';

    vm.weight = weight ?
      (vm.measureSystem ? weight.kg : weight.kg * 2.20462) :
      (defaultWeightKg ? (vm.measureSystem ? defaultWeightKg : defaultWeightKg * 2.20462) : '');

    vm.weightPlaceholder = vm.weight.toString() || '0';

    if (vm.weight) {
      vm.weight = _.round(vm.weight, 1);
    }

    vm.isToday = moment().format('YYYY-MM-DD') === date.format('YYYY-MM-DD');

    vm.now       = !weight && vm.isToday;
    vm.timestamp = (weight ? moment(weight.timestamp) : date).toDate();

    vm.changeMeasureSystem = () => {
      vm.unit = vm.measureSystem ? 'kg' : 'lb';

      // convert prev value to current measure system
      if (vm.weight) {
        vm.weight = _.round(vm.measureSystem ? vm.weight * 0.453592 : vm.weight * 2.20462, 1);
      }
      vm.weightPlaceholder = _.round(vm.measureSystem ? vm.weightPlaceholder * 0.453592 : vm.weightPlaceholder * 2.20462, 1).toString();
    };

    vm.getKg = function () {
      if (vm.measureSystem === 0) {
        return vm.weight * 0.453592;
      }

      return vm.weight;
    };

    vm.add = () => vm.weight = +vm.weight + 0.5;
    vm.subtract = () => {
      vm.weight = +vm.weight - 0.5;
      if (vm.weight <= 0) {
        vm.weight = '';
      }
    };

    vm.submit = () => {
      vm.$error = null;
      if (vm.weight) {
        nixTrackApiClient('/weight/log', {
          method: weight ? 'PUT' : 'POST',
          data:   {
            weights: [{
              id:        weight ? weight.id : undefined,
              timestamp: (vm.now ? moment() : moment(vm.timestamp)).format(),
              kg:        vm.getKg()
            }]
          }
        })
          .then(() => {
            $rootScope.$broadcast('track:weight-saved');
            $modalInstance.close();
          })
          .catch(error => {
            vm.submit.$error = error.data || error;
          });
      }
    };

    vm.close = () => {$modalInstance.dismiss();};

    vm.delete = () => {
      if (!vm.edit) {return;}
      vm.$error = null;
      confirm('Are you sure you want to delete this record?')
        .then(() => {
          nixTrackApiClient('/weight/log', {
            method: 'DELETE',
            data:   {
              weights: [{id: vm.edit.id}]
            }
          })
            .then(() => {
              $rootScope.$broadcast('track:weight-deleted');
              $modalInstance.close();
            })
            .catch(error => {
              vm.$error = error.data || error;
            });
        })
    };

    $timeout(() => vm.focus = true, 300);
  }
})();
