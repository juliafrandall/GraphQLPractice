(function () {
  'use strict';

  angular
    .module('restaurantMap')
    .controller('restaurantMapCtrl', restaurantMapCtrl)
    .factory('restaurantMap', restaurantMapFactory);

  function restaurantMapCtrl($scope, $http,
                             $location, debounce, Analytics,
                             $timeout, nixTrackApiClient,
                             leafletData, restaurantMap, $templateCache) {
    const vm = $scope.vm = this;
    let leafletMap;

    vm.center = {};
    vm.bounds = {};

    vm.searchItem = $location.search().q || '';

    let refreshItemSuggestions = debounce(($select, search) => {
      nixTrackApiClient('/search/instant', {
        params: {
          query:   search,
          branded: false,
          self:    false,
          common:  true,
        }
      })
        .then(response => {
          if ($select.search === search) {
            vm.itemSuggestions = response.data.common.map(f => f.food_name);
            vm.itemSuggestions.unshift(search);
            vm.itemSuggestions = _.unique(vm.itemSuggestions);
          }
        })
    }, 100);

    vm.refreshItemSuggestions = ($select) => {
      if (!vm.refreshItemSuggestions.init) {
        vm.refreshItemSuggestions.init = true;
        $select.search                 = vm.searchItem;
        return;
      }

      let search    = $select.search;
      // vm.searchItem = search;
      // vm.processLocations.debounced();

      if (search) {
        vm.itemSuggestions = [search];
        refreshItemSuggestions($select, search);
      } else {
        vm.itemSuggestions = [''];
      }
    };

    vm.setCenter = center => {
      _.forEach(center, (v, k) => {
        center[k] = parseFloat(v);
      });

      _.extend(vm.center, center);
    };

    vm.searchLocation = () => {
      vm.searchLocation.reset();

      if (vm.currentLocation) {
        $http.get('//nominatim.openstreetmap.org/search', {params: {q: vm.currentLocation, format: 'json'}})
          .then(response => {
            if (response.data.length) {
              let geo = vm.searchLocation.$result = response.data[0];

              vm.setCenter({
                lat:  geo.lat,
                lng:  geo.lon,
                zoom: 15
              });
            } else {
              vm.searchLocation.$error = {code: 404, message: 'nothing was found for this request'};
            }
          })
          .catch(response => {
            vm.searchLocation.$error = response.data;
          })
      }
    };

    vm.searchLocation.reset = () => {
      vm.searchLocation.$error  = null;
      vm.searchLocation.$result = null;
    };

    vm.reloadLocations = debounce(() => {
      let hash = JSON.stringify(vm.bounds);

      vm.unsupportedLocation = false;
      return restaurantMap.loadLocations(vm.bounds, $location.search().bid)
        .then(locations => {
          if (hash !== JSON.stringify(vm.bounds)) { return; }

          vm.locations = locations;
          vm.processLocations();

        })
        .catch(response => {
          if (response.status === 501) {
            vm.unsupportedLocation = true;
          }
        })
    }, 1000);

    vm.render = (locations, callback = null) => {
      let focusedMarker = _.find(vm.markers, {focus: true});

      let results = _.unique(locations, l => l.brand_id);

      vm.markers = [];
      return $timeout(() => {
        vm.results = results;

        vm.markers = locations.map(l => ({
          // autoPan:         false,
          // popupOptions:    {autoPan: false},
          brandId:         l.brand_id,
          focus:           !!(focusedMarker &&
            `${focusedMarker.brandId}:${focusedMarker.lat}:${focusedMarker.lng}` ===
            `${l.brand_id}:${l.lat}:${l.lng}`),
          lat:             l.lat,
          lng:             l.lng,
          draggable:       false,
          getMessageScope: function () {
            let scope   = $scope.$new(true);
            scope.l     = l;
            scope.brand = l.brand;

            return scope;
          },
          message:         $templateCache.get("/nix_app/restaurantMap/restaurantMap.popup.html"),
          compileMessage:  true,
        }));

        angular.isFunction(callback) && $timeout(callback);
      })
    };

    vm.showOnMap = l => {
      let focusedMarker = _.find(vm.markers, {focus: true});
      if (focusedMarker) {
        focusedMarker.focus = false;
      }

      let targetMarker = _.find(vm.markers, {
        brandId: l.brand_id,
        lat:     l.lat,
        lng:     l.lng,
      });

      if (targetMarker) {
        targetMarker.focus = true;
      }

      $('body').scrollTop(0);
    };

    vm.centerOnUserLocation = () => {
      vm.currentLocation = '';
      vm.searchLocation.reset();

      vm.geolocating = true;
      restaurantMap.getCurrentPosition()
        .then(position => {
          vm.geolocating = false;
          vm.setCenter({
            lat:  position.lat,
            lng:  position.lng,
            zoom: 15
          })
        })
        .catch(error => {
          vm.geolocating = 'error';
          console.error(error);
        });
    };

    vm.processLocations = (userSearch = false) => {
      if (!vm.locations) {return;}

      let term = vm.searchItem;
      $location.search('q', term || null);

      if (vm.searchItem) {
        if (userSearch) {
          Analytics.trackEvent('Restaurant Map', 'Item Search', vm.searchItem);
        }
        nixTrackApiClient('/search/instant', {
          params: {
            query:     vm.searchItem,
            branded:   true,
            self:      false,
            common:    false,
            brand_ids: JSON.stringify(_.unique(vm.locations.map(l => l.brand_id)))
          }
        })
          .then(response => {
            if (vm.searchItem !== term) {return;}

            const foods          = response.data.branded;
            const foundLocations = foods.map(f => f.nix_brand_id);

            let locations = vm.locations.filter(l => foundLocations.indexOf(l.brand_id) > -1);
            locations     = _.cloneDeep(locations);
            locations.forEach(l => l.items = []);

            foods.forEach(food => {
              _.find(locations, {brand_id: food.nix_brand_id}).items.push(food);
            });

            vm.render(locations);
          });
      } else {
        let locations = _.cloneDeep(vm.locations);
        locations.forEach(l => l.items = l.brand.popularTrackItems);

        vm.render(locations);
      }
    };

    vm.processLocations.debounced = debounce(() => {
      vm.processLocations();
    });

    // Controller initialisation

    if (($location.search().c || '').split(':').length === 2) {
      $location.search('c', $location.search().c + ':15');
    }

    $scope.$on("centerUrlHash", function (event, centerHash) {
      $location.search('c', centerHash);
    });

    $scope.$watchCollection('vm.bounds', bounds => {
      if (bounds && bounds.northEast && bounds.southWest && !vm.geolocating) {
        vm.reloadLocations();
      }
    });

    leafletData.getMap('restMap').then(function (map) {
      leafletMap = map;

      // bounds aren't automatically updated on map resize
      $scope.$watch(() => JSON.stringify(map.getBounds()), () => {
        let bounds = map.getBounds();
        _.merge(vm.bounds, {
          northEast: bounds._northEast,
          southWest: bounds._southWest
        });
      });
    });

    if ($location.search().c && $location.search().c !== '0.0000:0.0000:1') {
      let settings = $location.search().c.split(':');
      let center   = {
        lat:  settings[0],
        lng:  settings[1],
        zoom: settings[2] || 15
      };

      vm.setCenter(center);
    } else {
      vm.centerOnUserLocation();
    }
  }

  function restaurantMapFactory(nixTrackApiClient, $q, BrandsFactory, $filter, $geolocation) {
    const brandInfoCache = {};
    let currentPosition;

    return {
      getCurrentPosition: function () {
        if (!currentPosition) {
          currentPosition = $geolocation
            .getCurrentPosition({timeout: 60000})
            .then(position => ({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }))
            // defaulting to nutritionix headquaters
            .catch(() => ({
              lat: 38.8982919,
              lng: -77.0273156
            }));
        }

        return currentPosition;
      },
      loadLocations:      function (bounds, brandId) {
        let params = {
          north_east: `${bounds.northEast.lat},${bounds.northEast.lng}`,
          south_west: `${bounds.southWest.lat},${bounds.southWest.lng}`,
          brand_id:   brandId
        };

        return nixTrackApiClient('/locations', {params})
          .then(response => {
            let locations = response.data.locations;

            locations.forEach(l => {
              if (!brandInfoCache[l.brand_id]) {
                brandInfoCache[l.brand_id] = BrandsFactory.getBrand(l.brand_id)
                  .then(brand => {
                    brandInfoCache[l.brand_id] = brand;
                  })
                  .catch(() => {
                    brandInfoCache[l.brand_id] = {
                      name:              $filter('ucwords')(l.provider_location_name),
                      popularTrackItems: []
                    };
                  })
                  .then(() => {
                    let brand = brandInfoCache[l.brand_id];
                    if (!brand.logo) {
                      brand.logo = '//d2eawub7utcl6.cloudfront.net/images/gray_nix_apple_small.png'
                    }

                    return brand;
                  })
              }

              $q.when(brandInfoCache[l.brand_id])
                .then(brand => l.brand = brand);
            });

            return $q.all(brandInfoCache).then(() => locations);
          })
      }
    };
  }

  // function postProcessMarkers() {
  //   leafletMap.eachLayer(layer => {
  //     if (layer.options && layer.options.brandId) {
  //       // markers postprocessing can go here
  //     }
  //   })
  // }

  // add user pointer
  // restaurantMap.getCurrentPosition().then(position => {
  //   vm.markers.push({
  //     lat:  position.lat,
  //     lng:  position.lng,
  //     icon: {
  //       iconUrl:    'https://nixdotcom.s3.amazonaws.com/assets/rainbowdot.gif',
  //       iconSize:   [10, 10],
  //       iconAnchor: [5, 5]
  //     }
  //   });
  // });

  // custom marker
  // icon:            vm.brandInfoCache[l.brand_id] && vm.brandInfoCache[l.brand_id].logo ? {
  //   iconUrl:     vm.brandInfoCache[l.brand_id].logo,
  //   // shadowUrl:    'https://c1.staticflickr.com/5/4034/4544827697_6f73866999_n.jpg',
  //   iconSize:    [36, null], // size of the icon
  //   // shadowSize:   [30, 30], // size of the shadow
  //   iconAnchor:  [18, 0], // point of the icon which will correspond to marker's location
  //   // shadowAnchor: [15, 15],  // the same for the shadow
  //   popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
  // } : {},


  // oms
  // oms        = new OverlappingMarkerSpiderfier(map, {nearbyDistance: 10});
  // oms.addListener('click', function (marker) {
  //   marker.openPopup();
  //   $timeout(() => marker._popup._adjustPan());
  //
  // });
  // oms.addListener('spiderfy', function (markers, rest) {
  //   // markers[0].openPopup();
  //   rest.forEach(m => m.setOpacity(0.3));
  //   map.closePopup();
  // });
  //
  // oms.addListener('unspiderfy', function (markers, rest) {
  //   rest.forEach(m => m.setOpacity(1));
  // });

})();
