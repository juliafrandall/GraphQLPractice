(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('RestaurantPlatformFactory', RestaurantPlatformFactory);

  function RestaurantPlatformFactory($http) {
    return {
      sendEmail: function (message) {
        return $http.post('/email/secure', {
          message:   [
                       'From: ' + (message.name || 'not provided'),
                       'Restaurant Name: ' + (message.restaurant || 'not provided'),
                       '# of locations: ' + (message.locations || 'not provided'),
                       'restaurantWebsite: ' + (message.restaurantWebsite || 'not provided'),
                       'Comments: ' + (message.comments || 'not provided')
                     ].join('<br>'),
          name:      message.name,
          subject:   'Restaurant Submission',
          email:     message.email,
          recaptcha: message.recaptcha
        }, {ignore500: true});
      }
    };
  }
})();
