(function () {
  "use strict";

  angular.module('account')
    .factory('user', function ($rootScope, $state, $localStorage, moment) {
      function UserProfile(profile) {
        angular.extend(this, angular.copy(profile));
      }

      const user = {
        getIsAuthenticated: function () {
          return !!this.get('id');
        },
        getIdentity:        function () {
          return $localStorage.user;
        },
        setIdentity:        function (userData) {
          $localStorage.user = userData;
        },
        setUserProfile:     function (profile) {
          if ($localStorage.user) {
            _.extend($localStorage.user.user, profile);
          }
        },
        getUserProfile:     function () {
          return new UserProfile($localStorage.user && $localStorage.user.user || {});
        },
        logout:             function () {
          this.setIdentity(null);
        },
        getTimezone:        function () {
          return moment.tz.guess() || _.get(this.getIdentity(), 'user.timezone') || "US/Eastern";
        },
        getIsCoach:         function () {
          return !!this.get('coach.code');
        },
        'get':              function (propertyName) {
          if (propertyName === 'jwt' || propertyName === 'x-user-jwt') {
            return _.get(this.getIdentity(), 'x-user-jwt');
          }

          let getter = 'get' + propertyName[0].toUpperCase() + propertyName.substring(1);

          if (angular.isFunction(this[getter])) {
            return this[getter]();
          }

          return _.get(this.getIdentity(), 'user.' + propertyName);
        }
      };

      UserProfile.prototype = user;

      return user;
    })
}());
