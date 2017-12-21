(function () {
  'use strict';

  angular
    .module('naturalDemo')
    .controller('naturalDemoCtrlExerciseCtrl', naturalDemoCtrlExerciseCtrl);

  function naturalDemoCtrlExerciseCtrl($scope, nixTrackApiClient, $location, $window, $timeout) {
    let vm = this;

    vm.init = () => {
      vm.query = $window.decodeURIComponent($location.search().q || '') || '';
      vm.submit();
    };

    vm.submit = () => {
      vm.data = null;
      vm.submit.$error = null;

      if (!vm.query) {return;}

      nixTrackApiClient('/natural/exercise', {method: 'POST', data: {query: vm.query}, ignore500: true})
        .success(data => {
          vm.data = data;

          data.nf_calories = data.exercises.reduce((acc, e) => acc += e.nf_calories, 0);
        })
        .error(error => {
          vm.submit.$error = error;
        })
    };

    vm.clear  = () => {vm.data = null;};
    vm.reload = () => {$timeout(vm.init);};

    vm.init();

    $scope.$watch('vm.query', () => {
      $location.search('q', vm.query || undefined);
    });
  }

})();
