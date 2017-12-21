(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('ContactFactory', ContactFactory);

  function ContactFactory($http, $log) {
    return {
      sendContactEmail: function (name, email, message) {
        $http.post('/sendgrid/contact-form', {
            name:    name,
            email:   email,
            message: message
          })
          .success(function (data) {
            $log.info(data);
          })
          .error(function (data) {
            $log.error(data);
          })
      }
    };
  }
})();
