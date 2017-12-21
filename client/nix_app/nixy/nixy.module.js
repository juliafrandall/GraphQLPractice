(function () {
  'use strict';

  angular
    .module('nixy', [])
    .provider('nixy', function () {
      const settings = {
        endpoint:           null,
        auth:               null,
        displayProbability: 100,
        displayDays:        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        displayHours:       {begin: 0, end: 24}
      };

      this.setSettings = function setCredentials(overrideSettings) {
        _.assign(settings, overrideSettings);
      };

      this.$get = function $get($http, user, $localStorage, Analytics, $location) {
        return {
          settings:    $http.get('https://s3.amazonaws.com/nixy/client-settings.json')
                         .then(response => _.assign({}, settings, response.data)),
          sendMessage: function (text) {
            Analytics.trackEvent('nixy', 'user message', text);

            return this.settings.then(settings => $http({
              url:     settings.endpoint,
              method:  'POST',
              headers: {
                "Authorization": settings.auth
              },
              data:    {
                inputText: text,
                userId:    user.get('id') || $localStorage.nixyId,
                referrer:  $location.absUrl()
              }
            })).then(response => response.data['body-json']);
          }
        };
      };
    })
    .config(function config(nixyProvider) {
      nixyProvider.setSettings({
        endpoint: "https://9gkw34d19f.execute-api.us-east-1.amazonaws.com/beta/message",
        auth:     "A14Sd3jkJd56sadf0L1u1c4i2l3leg9523df"
      });
    })
    .run(function run($window, $localStorage) {
      if (!$localStorage.nixyId) {
        $localStorage.nixyId = 'ANONYMOUS:' + $window.uuid();
      }
    })

})();
