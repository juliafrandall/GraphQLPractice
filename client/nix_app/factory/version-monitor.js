(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('versionMonitor', function ($http, $timeout, $window, globalAlert) {
      let versionMonitor = {
        version:   null,
        outdated:  false,
        heartbeat: function () {
          return $http.get('/version', {ignoreLoadingBar: true})
            .success(version => {
              if (this.version) {
                if (this.version !== version.version) {
                  this.outdated = true;
                  globalAlert.warning(
                    'The page is outdated. Please <a href ng-click="alert.bindings.versionMonitor.refresh()">refresh it</a>',
                    null,
                    {versionMonitor}
                  )

                }
              } else {
                this.version = version.version;
              }
            })
            .finally(() => {
              if (!this.outdated) {
                $timeout(() => {this.heartbeat()}, 600000);
              }
            })
        },
        refresh:   function () {
          $window.location.reload();
        }
      };

      versionMonitor.heartbeat();

      return versionMonitor;
    })
}());
