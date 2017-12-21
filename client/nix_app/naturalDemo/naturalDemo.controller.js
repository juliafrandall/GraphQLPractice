(function () {
  'use strict';

  angular
    .module('naturalDemo')
    .controller('naturalDemoCtrl', naturalDemoCtrl);

  function naturalDemoCtrl($scope, $filter, nixTrackApiClient, moment, $location, debounce, nixTrackUtils) {
    const vm                 = this;
    const topMicronutrients  = [305, 306, 262];
    const skipMicronutrients = nixTrackApiClient.macronutrients.concat(topMicronutrients);

    const paramsMap = [
      {
        locationParam:   'q',
        controllerParam: 'input',
        'default':       ''
      },
      {
        locationParam:   'line_delimited',
        controllerParam: 'line_delimited',
        'default':       false
      },
      {
        locationParam:   'use_raw_foods',
        controllerParam: 'use_raw_foods',
        'default':       false
      },
      {
        locationParam:   'use_branded_foods',
        controllerParam: 'use_branded_foods',
        'default':       false
      },
      {
        locationParam:   's',
        controllerParam: 'servingsQty',
        'default':       1,
        clean:           false
      }
    ];

    vm.foodGroups = [
      {id: 1, label: 'Dairy'},
      {id: 2, label: 'Protein'},
      {id: 3, label: 'Fruit'},
      {id: 4, label: 'Vegetable'},
      {id: 5, label: 'Grain'},
      {id: 6, label: 'Fat'},
      {id: 7, label: 'Legume'},
      {id: 8, label: 'Combination'}
    ];

    vm.foodGroups.byId = {};
    vm.foodGroups.forEach(g => vm.foodGroups.byId[g.id] = g.label);

    vm.syncToLocation = () => {
      paramsMap.forEach(param => {
        $location.search(param.locationParam, vm[param.controllerParam] === param['default'] ? null : vm[param.controllerParam]);
      });
    };

    vm.syncFromLocation = () => {
      paramsMap.forEach(param => {
        let changed = false;

        let currentLocationValue = $location.search()[param.locationParam];

        if (_.isUndefined(currentLocationValue)) {
          currentLocationValue = param['default'];
        }

        if (_.isString(currentLocationValue) && currentLocationValue.match(/^([0-9]+|true|false)$/)) {
          currentLocationValue = JSON.parse(currentLocationValue);
        }

        if (vm[param.controllerParam] !== currentLocationValue) {
          changed                   = true;
          vm[param.controllerParam] = currentLocationValue;
        }

        if (changed) {
          vm.process();
        }
      });
    };

    vm.changeServingsQty = function () {
      if (vm.servingsQty > 0) {
        vm.calculateTotal();
      }
    };

    vm.calculateTotal = function () {
      vm.total = $filter('trackFoodToLabelData')(
        nixTrackUtils.sumFoods(vm.foods),
        {
          showItemName:                   false,
          showServingUnitQuantity:        false,
          showServingUnitQuantityTextbox: false,
          micronutrients:                 []
        },
        vm.servingsQty
      );

      _.forEach(topMicronutrients, function (nutrientId) {
        let nutrient = $filter('nutrient')(vm.total.full_nutrients, nutrientId);
        if (nutrient) {
          vm.total.micronutrients.push(nutrient);
        }
      });

      _.forEach(vm.total.full_nutrients, function (nutrient) {
        if (_.indexOf(skipMicronutrients, nutrient.attr_id) === -1) {
          vm.total.micronutrients.push(nutrient);
        }
      });
    };

    vm.clean = () => {
      vm.foods    = [];
      vm.total    = null;
      vm.error    = null;
      vm.errors   = null;
      vm.notFound = null;
    };

    vm.process = debounce(function () {
      if (vm.input) {
        vm.clean();

        vm.process.$request = {start: moment()};
        nixTrackApiClient.natural.nutrients({
            query:        vm.input,
            timezone:     moment.tz.guess() || "US/Eastern",
            line_delimited: vm.line_delimited,
            use_raw_foods:  vm.use_raw_foods,
            use_branded_foods: vm.use_branded_foods
          }, true)
          .success(function (data) {
            vm.process.$request.end      = moment();
            vm.process.$request.duration = vm.process.$request.end.diff(vm.process.$request.start);

            if (!data.foods.length) {
              vm.notFound = {
                message: "We couldn't match any of your foods"
              };
              return;
            }

            vm.foods  = data.foods;
            vm.errors = data.errors;

            vm.foods.forEach(food => {
              nutritionixApiDataUtilities.extendFullNutrientsWithMetaData(food.full_nutrients || []);

              food.metadata = angular.merge(
                {photo: {thumbnail: '//d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png'}},
                food.metadata || {}
              );
            });

            vm.calculateTotal();

          })
          .error(function (error) {
            if (error.message === "We couldn't match any of your foods") {
              vm.notFound = error;
            } else {
              vm.error = error;
            }
          })
      }
    }, 100);

    vm.getQ2Link = () => {
      return '/q2?' + $.param({
          i: vm.input,
          s: vm.servingsQty,
          n: 'Recipe',
          b: 'Brand'
        });
    };

    vm.syncFromLocation();
    vm.process();

    $scope.$watchCollection(() => $location.search(), (newVal, oldVal) => {
      if (!_.isEqual(newVal, oldVal)) {
        vm.syncFromLocation();
      }
    });

    $scope.$watchGroup(paramsMap.map(p => `vm.${p.controllerParam}`), (newVal, oldVal) => {
      if (!_.isEqual(newVal, oldVal)) {
        vm.syncToLocation();
      }
    });

    $scope.$watchGroup(paramsMap.filter(p => p.clean !== false).map(p => `vm.${p.controllerParam}`), (newVal, oldVal) => {
      if (!_.isEqual(newVal, oldVal)) {
        vm.clean();
      }
    });

    $scope.$watch('vm.line_delimited', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        vm.use_raw_foods = newVal;
      }
    });

    $scope.$watch('vm.use_raw_foods', newVal => {
      if (newVal) {
        vm.line_delimited = true;
      }
    });
  }

})();
