(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('MiniFactory', MiniFactory);

  function MiniFactory($http, $q) {
    var factory = {
      sendEmail: sendEmail
    };

    function sendEmail(data) {
      return $http.post('/email', data, {ignore500: true});
    }

    return factory;
  }
})();
