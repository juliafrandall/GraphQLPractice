(function () {
  'use strict';

  angular
    .module('fda-compliance')
    .controller('fdaComplianceCtrl', fdaComplianceCtrl);

  function fdaComplianceCtrl($scope, $http, vcRecaptchaService, Analytics) {
    const vm = $scope.vm = this;

    vm.form1 = vm.form2 = null;

    vm.initModel = () => {
      vm.model = {
        name:    '',
        email:   '',
        message: ''
      };
    };

    vm.initModel();

    vm.recaptcha1 = {
      response: null,
      widgetId: null
    };

    vm.recaptcha2 = {
      response: null,
      widgetId: null
    };

    vm.submit = (form, recaptcha) => {
      Analytics.trackEvent('button', 'click', 'send message: fda compliance');

      if (form.$valid) {
        vm.closeAlertMessage();
        vm.closeSuccessAlertMessage();

        $http.post('/email/secure', {
            message:   [
                         'From: ' + (vm.model.name || 'not provided'),
                         'Comments: ' + (vm.model.message || 'not provided')
                       ].join('\n'),
            name:      vm.model.name,
            subject:   'FDA Compliance',
            email:     vm.model.email,
            recaptcha: recaptcha.response
          }, {ignore500: true})
          .then(function () {
            vm.initModel();
            vm.successMessage = "We'll be in contact shortly!";
            vm.errorMessage   = "";

            vm.form1.$setPristine();
            vm.form2.$setPristine();
          })
          .catch(function (response) {
            if (angular.isString(response.data)) {
              vm.errorMessage = response.data;
            } else if (angular.isObject(response.data) && response.data.message) {
              vm.errorMessage = response.data.message;
            } else {
              vm.errorMessage = 'Unexpected backend error';
            }
          })
          .finally(() => {
            vcRecaptchaService.reload(vm.recaptcha1.widgetId);
            vcRecaptchaService.reload(vm.recaptcha2.widgetId);
          })
      } else {
        angular.forEach(form, function (property, key) {
          if (key[0] !== '$' && property.$invalid) {
            property.$setDirty();
          }
        });
      }
    };


    vm.closeAlertMessage = function () {
      vm.errorMessage = "";
    };

    vm.closeSuccessAlertMessage = function () {
      vm.successMessage = "";
    };
  }
})();
