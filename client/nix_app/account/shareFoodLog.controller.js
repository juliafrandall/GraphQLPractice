(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountShareFoodLogCtrl', AccountShareFoodLogCtrl);

  function AccountShareFoodLogCtrl($scope, moment, user, nixTrackApiClient, $window, $timeout) {
    var vm = $scope.vm = this;

    vm.begin = {
      minDate: null,
      maxDate: moment().subtract(2, 'days').startOf('day').toDate(),
      value:   moment().add(-8, 'day').startOf('day').toDate(),
      opened:  false
    };

    vm.begin.initialValue = vm.begin.value;

    vm.end = {
      minDate: null,
      maxDate: moment().subtract(1, 'day').startOf('day').toDate(),
      value:   moment().subtract(1, 'day').startOf('day').toDate(),
      opened:  false
    };

    vm.end.initialValue = vm.end.value;

    vm.user = user.getIdentity().user;

    vm.recipient = '';


    vm.submit = (preview) => {
      let previewWindow;
      if (preview) {
        previewWindow = $window.open();
        previewWindow.document.write(
          `<html>
            <head><title>Preview Shared Food Log</title></head>
            <body>Preview is loading...</body>
          </html>`
        );
      }

      vm.submit.$success = null;
      vm.submit.$error   = null;
      vm.submit.$busy    = true;
      vm.submit.$preview = preview;

      nixTrackApiClient(
        '/share/log',
        {
          method: 'POST',
          data:   {
            timezone: user.getTimezone(),
            begin:    vm.begin.value ? moment(vm.begin.value).format('YYYY-MM-DD') : undefined,
            end:      vm.end.value ? moment(vm.end.value).format('YYYY-MM-DD') : undefined,
            email:    vm.recipient
          },
          params: {preview}
        }
      )
        .success(response => {
          vm.submit.$success = true;
          $timeout(() => {vm.submit.$success = null}, 3000);

          if (preview) {
            angular.element(previewWindow.document).find('body').html(response);
          }
        })
        .error(error => {
          vm.submit.$error = error;
        })
        .finally(() => {
          vm.submit.$busy = false;
        })
    }
  }
})();
