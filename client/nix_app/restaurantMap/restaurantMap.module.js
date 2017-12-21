(function () {
  'use strict';

  angular
    .module('restaurantMap', ['ngGeolocation', 'nemLogging', 'ui-leaflet', 'ui-rangeSlider', 'nutritionix.disqus'])
    .config(config)
    .run(function (leafletMapDefaults) {
      leafletMapDefaults.setDefaults({
        tileLayer:        '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        tileLayerOptions: {
          attribution: 'Tiles &copy; Esri &mdash; ' +
                       'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, ' +
                       'METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        },
      });
    });

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.restaurantMap', {
      url:         '/restaurant-map',
      metaTags:    {
        title:       'Restaurant Nutrition Map',
        description: 'Restaurant Nutrition Map'
      },
      controller:  'restaurantMapCtrl',
      templateUrl: baseUrl + '/nix_app/restaurantMap/restaurantMap.html',
      data: {
        cssClass: 'page-restaurant-map'
      }
    });
  }

  angular.module('ui-leaflet')
    .run(function ($timeout) {
      // panning works incorrectly for pop-up with dynamic angular content.
      // Delaying it to the end of the stack fixes the bug.
      let adjustPan                = L.Popup.prototype._adjustPan;
      L.Popup.prototype._adjustPan = function () {
        $timeout(() => adjustPan.call(this));
      };
    })
})();
