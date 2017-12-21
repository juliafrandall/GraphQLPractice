(function () {
  'use strict';

  angular
    .module('account')
    .controller('SmsRemindersCtrl', SmsRemindersCtrl);

  function SmsRemindersCtrl($scope, nixTrackApiClient, confirm) {
    var vm = $scope.vm = this;

    let loadMe = () => {
      loadMe.$promise = nixTrackApiClient.me().success(me => {
        vm.me = me;
        vm.toggle.state = !!(me.mobile_number && me.enable_weekday_sms);
      });

      return loadMe.$promise;
    };
    loadMe();

    vm.toggle = () => {
      loadMe.$promise.then(() => {
        if (!vm.toggle.state) {
          return vm.disable();
        }
        if (vm.me.mobile_number) {
          return vm.enable();
        }

        vm.link.show();
      });
    };
    vm.toggle.state = false;

    vm.link = () => {
      if (!vm.link.phone) { return; }

      nixTrackApiClient(
        '/auth/sms/verification',
        {params: {mobile_number: vm.link.phone}}
      )
        .success(() => {
          vm.link.$initiated = true;
          vm.link.message = 'You have initiated mobile number linking';
          vm.link.messageType = 'success';
        })
        .error(() => {
          vm.link.message = 'Mobile number verification failed :(';
          vm.link.messageType = 'danger';
        })
    };

    vm.link.show = () => {vm.link.$visible = true;};

    vm.link.hide = () => {vm.link.$visible = false;};

    vm.link.closeMessage = () => {
      vm.link.message = null;
      vm.link.messageType = null;
    };

    vm.confirm = () => {
      let code = vm.confirm.code;

      if (!code) { return; }

      code = code.toString();

      if (code.indexOf('-') === -1) {
        code = code.substr(0, 3) + '-' + code.substr(3, 3);
      }

      nixTrackApiClient(
        '/auth/sms/verification',
        {
          method: 'POST',
          data:   {code}
        }
      )
        .then(() => {
          vm.confirm.$completed = true;
          return vm.enable();
        })
        .then(() => loadMe())
        .then(() => {vm.link.hide();})
        .catch(() => { vm.confirm.message = 'Mobile number verification failed :('; })
    };

    vm.confirm.closeMessage = () => {
      vm.confirm.message = null;
    };

    vm.unlink = () => {
      return nixTrackApiClient('/auth/sms/verification', {method: 'DELETE'})
        .success(() => {
          vm.unlink.$completed = true;
          loadMe();
        })
        .error(() => { vm.unlink.message = 'Unlinking mobile number verification failed :('; })
    };

    vm.unlink.confirm = () => {
      return confirm('Are you sure you want to unlink your mobile number')
        .then(() => {
          return vm.unlink();
        });
    };

    vm.disable = () => {
      return nixTrackApiClient.me.preferences({enable_weekday_sms: 0})
        .then(() => {
          vm.link.hide();
          return loadMe();
        });
    };

    vm.enable = () => {
      return nixTrackApiClient.me.preferences({enable_weekday_sms: 1})
        .then(() => {return loadMe();});
    };
  }
})();
