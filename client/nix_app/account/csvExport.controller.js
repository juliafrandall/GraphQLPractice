(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountCsvExportCtrl', AccountCsvExportCtrl);

  function AccountCsvExportCtrl($scope, moment, user, nixTrackApiClient, $filter, $cookies) {
    const vm = $scope.vm = this;

    vm.type = 1;

    vm.begin = {
      minDate: moment().startOf('day').subtract(30, 'days').toDate(),
      maxDate: moment().startOf('day').toDate(),
      value:   moment().add(-7, 'day').startOf('day').toDate(),
      opened:  false
    };

    vm.begin.initialValue = vm.begin.value;

    vm.end = {
      minDate: null,
      maxDate: moment().startOf('day').toDate(),
      value:   moment().startOf('day').toDate(),
      opened:  false
    };

    vm.end.initialValue = vm.end.value;

    vm.user = user;

    vm.recipient = '';

    $cookies.put('trackApiToken', user.get('jwt'));
  }
})();
