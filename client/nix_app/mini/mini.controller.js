(function () {
  'use strict';

  angular
    .module('mini')
    .controller('miniCtrl', miniCtrl);

  function miniCtrl($scope, MiniFactory, $modal, ServicesFactory, Analytics) {

    //
    // VARIABLES
    //
    var vm = this;

    //
    // FUNCTIONS
    //
    vm.clearErrorMessage = function () {
      vm.errorMessage = "";
    };

    vm.sendEmail = function (formData) {
      Analytics.trackEvent('button', 'click', 'send message');
      vm.clearErrorMessage();

      if (!$scope.form) { return; }

      if ($scope.form.$valid) {
        formData.subject = $scope.subject;
        formData.inquiry = $scope.inquiry;
        MiniFactory.sendEmail(formData)
          .then(function (results) {
            vm.user = {};
            $modal.open({
              templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/mini/mini.modal.html'),
              controller:  'miniModalCtrl as vm',
              size:        'sm',
              resolve:     {
                results: function () {
                  return results;
                }
              }
            });

            $scope.form.$setPristine();
          })
          .catch(function (response) {
            vm.errorMessage = angular.isString(response.data) ? response.data : 'Unexpected backend error';
          });
      } else {
        angular.forEach($scope.form, function (property, key) {
          if (key[0] !== '$' && property.$invalid) {
            property.$setDirty();
          }
        });
      }
    }
  }
})();
