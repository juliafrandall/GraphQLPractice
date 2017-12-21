(function () {
  'use strict';

  angular
    .module('privacy')
    .controller('PrivacyCtrl', PrivacyCtrl);


  function PrivacyCtrl($scope, $http, $sce) {
    $http.get('//www.iubenda.com/api/privacy-policy/7754733')
      .success(function (data) {
        $scope.iubenda = $sce.trustAsHtml(data.content);
      })
      .error(function () {
        $scope.showDefault = true;
      })
  }
})();

