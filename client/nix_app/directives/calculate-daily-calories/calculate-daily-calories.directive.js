(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('dailyCaloriesCalculator', function () {
      return {
        restrict:         'E',
        controller:       dailyCaloriesCalculatorController,
        controllerAs:     'vm',
        scope:            {},
        bindToController: {
          backButtonUrl:        '=?',
          preset:               '=?',
          widgetControlButtons: '=?',
          controlButtons:       '=?',
          userDailyCalories:    '=?'
        },
        templateUrl:      '/nix_app/directives/calculate-daily-calories/calculate-daily-calories.directive.html',
        link:             dailyCaloriesCalculatorLink
      }
    });

  function dailyCaloriesCalculatorLink(scope, element, attributes, vm) {
    vm.enableUserCaloriesWidget = angular.isDefined(attributes.enableUserCaloriesWidget);
    vm.enableSaveUserCalories = angular.isDefined(attributes.enableSaveUserCalories);
    vm.syncUserDailyCalories = angular.isDefined(attributes.syncUserDailyCalories);
    vm.enableExerciseLevel = angular.isDefined(attributes.enableExerciseLevel);
  }

  function dailyCaloriesCalculatorController($filter, $scope, $timeout, debounce, moment,
                                             nixTrackCalculator, user, nixTrackApiClient, $q) {

    let vm = this;

    vm.user = user;


    let preset = {
      u: 'i',
      g: 'f',
      w: 63.5,
      h: 166,
      a: 30,
      e: 0
    };

    if (vm.preset) {
      let keyValuePairs = _.filter(vm.preset.split(','));
      _.each(keyValuePairs, function (keyValue) {
        let parts = keyValue.split(':');
        if (parts.length === 2) {
          preset[parts[0]] = parts[1] === 'null' ? null : parts[1];
        }
      });
    }


    vm.exerciseLevels = nixTrackCalculator.exerciseLevels;

    vm.unitSystem = preset.u === 'i' ? 'imperial' : 'metric';
    vm.gender = preset.g === 'f' ? 'female' : 'male';
    vm.weight = {
      kg: preset.w,
      lb: null
    };
    vm.height = {
      cm:   preset.h,
      ft:   null,
      inch: null
    };
    vm.age = preset.a;
    vm.exerciseLevel = parseInt(preset.e || 0);

    vm.getRecommendedCalories = function (round) {
      if (vm.gender && vm.weight.kg > 0 && vm.height.cm > 0 && vm.age > 0) {
        let value = nixTrackCalculator.calculateRecommendedCalories(
          vm.gender,
          vm.weight.kg,
          vm.height.cm,
          vm.age,
          vm.enableExerciseLevel ? vm.exerciseLevel : 0
        );

        if (round) {
          value = $filter('fdaRound')(value, 'calories');
        }

        return value;
      }

      return 2000;
    };

    vm.calculateWeights = function (unitSystem) {
      if ((unitSystem || vm.unitSystem) === 'metric') {
        vm.weight.lb = _.round(vm.weight.kg * 2.20462, 1);
      } else {
        vm.weight.kg = _.round(vm.weight.lb * 0.453592, 1);
      }
    };

    vm.calculateHeights = function (unitSystem) {
      if ((unitSystem || vm.unitSystem) === 'metric') {
        vm.height.inch = vm.height.cm * 0.393701;

        if (vm.height.inch > 12) {
          vm.height.ft = _.floor(vm.height.inch / 12);
          vm.height.inch -= vm.height.ft * 12;
        } else {
          vm.height.ft = 0;
        }
      } else {
        vm.height.cm = (vm.height.ft || 0) * 30.48 + (vm.height.inch || 0) * 2.54;
      }

      _.each(vm.height, (value, key) => vm.height[key] = value === null ? null : (_.round(value) || 0));
    };

    vm.calculateHeights('metric');
    vm.calculateWeights('metric');

    let mePromise;

    if (user.getIsAuthenticated()) {
      mePromise = nixTrackApiClient.me();
    }

    // run after link function
    $timeout(() => {
      if (vm.syncUserDailyCalories) {
        vm.userDailyCalories = vm.getRecommendedCalories(true);
      } else if (!vm.userDailyCalories && user.getIsAuthenticated()) {
        vm.userDailyCalories = user.getUserProfile().daily_kcal || 2000;
        mePromise.then(response => {
          let me               = response.data;
          vm.userDailyCalories = me.daily_kcal || 2000;
        });
      }

      if (vm.enableSaveUserCalories && user.getIsAuthenticated()) {
        vm.saveDailyCalories = function () {
          vm.saveDailyCalories.$busy = true;
          vm.saveDailyCalories.$success = null;
          vm.saveDailyCalories.$error = null;

          nixTrackApiClient.me.preferences({
              daily_kcal:             vm.userDailyCalories,
              default_nutrient:       208,
              default_nutrient_value: vm.userDailyCalories
            })
            .success((profile) => {
              user.setUserProfile(profile);
              vm.saveDailyCalories.$success = true;
              $timeout(() => {vm.saveDailyCalories.$success = null;}, 3000);
            })
            .error(error => {vm.saveDailyCalories.$error = error;})
            .finally(() => {vm.saveDailyCalories.$busy = false;});
        };
      }
    });

    let saveUserData = debounce(function () {
      if (user.getIsAuthenticated()) {
        nixTrackApiClient.me.preferences({
          height_cm:      (vm.unitSystem === 'imperial' ? (vm.height.ft || 0) * 30.48 + (vm.height.inch || 0) * 2.54 : vm.height.cm) || null,
          weight_kg:      (vm.unitSystem === 'imperial' ? vm.weight.lb * 0.453592 : vm.weight.kg) || null,
          birth_year:     vm.age ? moment().utc().format('YYYY') - vm.age : null,
          gender:         vm.gender || null,
          exercise_level: vm.exerciseLevel,
          measure_system: vm.unitSystem === 'imperial' ? 0 : 1
        }).success(profile => {user.setUserProfile(profile);});
      }
    }, 1000);

    if (mePromise) {
      let applyProfile = me => {
        if (me.height_cm) {
          vm.height.cm = me.height_cm;
          vm.calculateHeights('metric');
        }
        if (me.weight_kg) {
          vm.weight.kg = me.weight_kg;
          vm.calculateWeights('metric');
        }

        if (me.birth_year) {vm.age = moment().utc().format('YYYY') - me.birth_year;}
        if (me.gender) {vm.gender = me.gender;}
        if (me.exercise_level) {vm.exerciseLevel = me.exercise_level;}
        if (me.measure_system !== null) {vm.unitSystem = me.measure_system === 0 ? 'imperial' : 'metric';}

      };

      applyProfile(user.getUserProfile());

      mePromise = mePromise.then(response => {
        applyProfile(response.data);
        return response;
      });
    }

    (mePromise || $q.resolve()).then(() => {
      // update preset binding
      $scope.$watch(
        () => [
          vm.unitSystem, vm.gender, JSON.stringify(vm.weight),
          JSON.stringify(vm.height), vm.age, vm.exerciseLevel
        ].join(','),

        (val, prev) => {
          if (val === prev) {return;}

          let preset = {
            u: vm.unitSystem[0],
            g: vm.gender[0],
            w: vm.weight.kg,
            h: vm.height.cm,
            a: vm.age,
            e: vm.exerciseLevel
          };

          vm.preset = _.map(preset, (value, key) => key + ':' + value).join(',');

          if (vm.syncUserDailyCalories) {
            vm.userDailyCalories = vm.getRecommendedCalories(true);
          }

          saveUserData();
        }
      );
    });
  }
}());
