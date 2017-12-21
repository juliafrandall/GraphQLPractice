(function () {
  'use strict';

  angular.module('nutritionix.disqus', [])
    .provider('disqus', function () {
      let created = false;

      /**
       * Public Service
       */
      this.$get = function ($q, $window, $location) {
        let ready   = $q.defer(),
            service = {};

        if ($location.host() === 'localhost') {
          window.disqus_url = 'https://nutritionix.com';
        }

        this._createScriptTag = function () {
          if (created === true) { return; }

          (function () {
            let se               = document.createElement('script');
            se.type              = 'text/javascript';
            se.async             = true;
            se.defer             = true;
            se.src               = 'https://nutritionix.disqus.com/embed.js';
            se['data-timestamp'] = +new Date();
            let done             = false;
            se.onload            = se.onreadystatechange = function () {
              if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                done = true;
                ready.resolve();
              }
            };
            let s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(se, s);
          })();

          created = true;
          return true;
        };


        this._createScriptTag();

        service.ready = ready.promise;

        service.reset = function (id) {
          if($location.host() === 'localhost') { return; }

          service.ready.then(() => {
            $window.DISQUS.reset({
              reload: true,
              config: function () {
                this.page.identifier = 'id';
                this.page.url        = $location.absUrl()
              }
            });
          });
        };

        return service;
      };
    })
    .directive('disqus', function (disqus) {
      return {
        restrict: 'A',
        replace:  true,
        scope:    {
          id: '=disqus'
        },
        template: '<div id="disqus_thread"></div>',
        link:     function (scope, element, attributes) {
          disqus.ready.then(() => {
            scope.$watch('id', function (id) {
              if (angular.isDefined(id)) {
                disqus.reset(id);
              }
            });
          });
        }
      };
    });
}());
