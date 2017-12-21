(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountDashboardCtrl', AccountDashboardCtrl);

  function AccountDashboardCtrl($rootScope, $scope, $state, user, ServicesFactory, $modal,
                                nixTrackApiClient, moment, $filter,
                                BrandsFactory, $location, globalAlert, me,
                                reviewFoodsBasket, nixTrackUtils, InstantSmartSearch,
                                consumedAt, $q, $sessionStorage) {
    let vm = $scope.vm = this;
    let timezone    = user.getTimezone();
    let restaurants = BrandsFactory.searchBrands('restaurant').catch(() => []);

    nixTrackApiClient.log.get({timezone, limit: 1}).success(log => {vm.showOnboarding = log.foods.length === 0;});

    vm.instantSmartSearch = new InstantSmartSearch();
    vm.reviewFoodsBasket  = reviewFoodsBasket;
    vm.me                 = me;
    vm.user               = user;
    vm.dietGraphApi       = null;

    function getIsVisible() {
      for (let i = 0; i < vm.foods.length; i += 1) {
        if (vm.foods[i].meal_type === this.type) {return true;}
      }

      return false;
    }

    vm.getHasSnack = function() {
      for (let i in vm.foods) {
        let mealType = vm.foods[i].meal_type;
        if(mealType === 2 || mealType === 4 || mealType === 6) { return true; }
      }

      return false;
    };

    vm.meals = [
      {label: null, type: null},
      {label: 'breakfast', type: 1},
      {label: 'AM Snack', type: 2, getIsVisible},
      {label: 'lunch', type: 3},
      {label: 'PM Snack', type: 4, getIsVisible},
      {label: 'dinner', type: 5},
      {label: 'Late Snack', type: 6, getIsVisible},
    ];

    if ($location.search().message === 'email_verified') {
      globalAlert.success('Your email is now verified');
    }


    vm.addFoodModal = function (mealType = null) {
      if (mealType) {
        let basketDate = vm.viewDate.clone().hours(({
          1: 9,
          2: 10,
          3: 12,
          4: 15,
          5: 19,
          6: 21
        })[mealType]);

        consumedAt.setValue(basketDate, mealType);
        vm.reviewFoodsBasket.openModal(true, mealType);
      } else {
        $modal.open({
          animation:   true,
          controller:  'addFoodModalCtrl',
          templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addFoodModal.html'),
          resolve:     {
            parentVm:    () => vm,
            restaurants: () => restaurants
          }
        });
      }
    };

    vm.editFoodModal = function (food) {
      $modal.open({
        animation:   true,
        controller:  'editFoodModalCtrl',
        size:        'edit-food',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/editFoodModal.html'),
        resolve:     {
          parentVm: () => vm,
          food:     () => angular.copy(food)
        }
      });
    };

    vm.dailyTotalModal = function (mealType) {
      $modal.open({
        animation:   true,
        controller:  'dailyTotalModalCtrl',
        size:        'label',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/dailyTotalModal.html'),
        resolve:     {
          parentVm: () => vm,
          foods:    () => vm.foods,
          mealType: () => mealType,
          viewDate: () => vm.viewDate,
          goals:    () => vm.goals,
          totals:   () => vm.totals,
        }
      });
    };

    vm.addExerciseModal = function (exercise) {
      $modal.open({
        animation:   true,
        size:        'exercise',
        controller:  'addExerciseModalCtrl',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addExerciseModal.html'),
        resolve:     {
          date:     () => vm.viewDate.clone().hours(moment().hours()).minutes(moment().minutes()),
          exercise: () => exercise
        }
      });
    };

    vm.addWeightModal = function (weight) {
      $modal.open({
        animation:   true,
        size:        'weigh-in',
        controller:  'addWeightModalCtrl',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addWeightModal.html'),
        resolve:     {
          date:            () => vm.viewDate.clone().hours(moment().hours()).minutes(moment().minutes()),
          weight:          () => weight,
          defaultWeightKg: () => {
            if (vm.weights && vm.weights.length) {
              return vm.weights[0].kg;
            }

            return nixTrackApiClient('/weight/log', {
              params: {
                       timezone,
                begin: moment().subtract(2, 'week').format(vm.dateFormat),
                limit: 1
              }
            })
              .then(function (response) {
                let weights = response.data.weights;
                if (weights.length) {
                  return weights[0].kg;
                }

                return 0;
              })
              .catch(() => 0)
          }
        }
      });
    };

    vm.addWaterModal = function () {
      $modal.open({
        animation:   true,
        size:        'water',
        controller:  'addWaterModalCtrl',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addWaterModal.html'),
        resolve:     {
          parentVm: () => vm
        }
      });
    };

    vm.dateFormat      = 'YYYY-MM-DD';
    vm.dateTimeFormat  = 'YYYY-MM-DD HH:mm:ss';
    vm.monthDateFormat = 'YYYY-MM';
    vm.today           = moment().startOf('day');
    vm.viewDate        = $state.params.date ? moment($state.params.date) : vm.today.clone();

    vm.go = {
      today: () => {
        vm.viewDate = vm.today.clone();
      },
      next:  () => {
        vm.viewDate.add(1, 'day');
      },
      prev:  () => {
        vm.viewDate.subtract(1, 'day');
      }
    };


    vm.loadLogs = function (cleanup = true) {
      if (cleanup) {
        vm.foods     = [];
        vm.weights   = [];
        vm.exercises = [];

        vm.stats.reset();
      }

      let begin = vm.viewDate.format(vm.dateTimeFormat);
      let end   = vm.viewDate.clone().endOf('day').format(vm.dateTimeFormat);

      let promises = [];

      promises.push(
        nixTrackApiClient.log.get({timezone, begin, end})
        .success(function (log) {
          vm.foods = log.foods;
          log.foods.forEach(food => {
            if (!food.photo) {
              food.photo = {thumb: "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png"};
            } else if (angular.isString(food.photo)) {
              food.photo = {thumb: food.photo};
            }
          });
        })
      );

      promises.push(
        nixTrackApiClient('/exercise/log', {params: {timezone, begin, end}})
          .success(function (log) {
            vm.exercises = log.exercises;
          })
      );

      promises.push(
        nixTrackApiClient('/weight/log', {params: {timezone, begin, end}})
          .success(function (log) {
            vm.weights = log.weights;
            if (vm.weights.length) {
              vm.weights.avg = _.sum(vm.weights.map(w => w.kg)) / vm.weights.length;
            }
          })
      );

      vm.goals  = _.pick(me, ['daily_kcal', 'daily_fat_pct', 'daily_protein_pct', 'daily_carbs_pct']);
      vm.totals = {
        total_cal:        0,
        total_cal_burned: 0
      };

      promises.push(
        nixTrackApiClient('/reports/totals', {params: {timezone, begin, end}})
          .success(function (log) {
            let totals = _.find(log.dates, {date: vm.viewDate.format(vm.dateFormat)});
            vm.goals   = _.pick(me, ['daily_kcal', 'daily_fat_pct', 'daily_protein_pct', 'daily_carbs_pct']);

            if (totals) {
              vm.totals = totals;
              vm.water  = totals.water_consumed_liter;

              if (totals.daily_kcal_limit) {
                vm.goals.daily_kcal = totals.daily_kcal_limit;
              }

              if (!(totals.daily_fat_pct === null && totals.daily_protein_pct === null && totals.daily_carbs_pct === null)) {
                _.assign(
                  vm.goals,
                  {
                    daily_fat_pct:     totals.daily_fat_pct,
                    daily_protein_pct: totals.daily_protein_pct,
                    daily_carbs_pct:   totals.daily_carbs_pct,
                  }
                )
              }
            }
          })
      );

      return $q.all(promises)
      .then(() => {
        vm.stats.calculate();
      });
    };


    vm.setProgressBarColor = function (total) {
      let caloriesPercentage = _.round(total / (vm.goals.daily_kcal) * 100, 2);
      let className          = '';

      if (caloriesPercentage >= 95 && caloriesPercentage < 100) {
        className = 'warning';
      }

      if (caloriesPercentage >= 100) {
        className = 'danger';
      }

      return className;
    };



    vm.refresh = () => {
      vm.dietGraphApi.refresh();
      vm.loadLogs(false);
    };

    vm.calendarClickHandler = function (date, value) {
      $rootScope.$broadcast('track:viewDate-changed', moment(date).format(vm.dateFormat));
    };

    [
      'track:foods-added', 'track:foods-updated', 'track:foods-deleted',
      'track:exercise-saved', 'track:exercise-deleted',
      'track:weight-saved', 'track:weight-deleted',
      'track:water-updated', 'track:goals-changed'
    ].forEach(event => {
      $scope.$on(event, () => {vm.refresh();});
    });

    $scope.$on('track:viewDate-changed', (event, date) => {
      vm.viewDate = moment(date);
    });

    vm.stats = {
      reset:     function () {
        ['total', 1, 2, 3, 4, 5, 6].forEach(group => {
          this[group] = {208: 0, 205: 0, 307: 0, 203: 0, 204: 0};
        });

        this.calories_burned = 0;
      },
      calculate: function () {
        this.reset();
        vm.foods.forEach(food => {
          [208, 205, 307, 203, 204].forEach(nutrient => {
            let value = $filter('nutrient')(food.full_nutrients, nutrient, 'value');
            if (value) {
              this.total[nutrient] += value;
              if (food.meal_type) {
                this[food.meal_type][nutrient] += value;
              }
            }
          })
        });

        this.calories_burned = vm.exercises.reduce((prev, cur) => prev + cur.nf_calories, 0);
      }
    };

    vm.dailyIntake = {
      primaryNutrients: {
        208: {id: 208, name: 'Cal', unit: 'kcal', round: 'calories'},
        205: {id: 205, name: 'Carbs', unit: 'g', round: 'total_carb'},
        307: {id: 307, name: 'Sodium', unit: 'mg', round: 'sodium'},
        203: {id: 203, name: 'Protein', unit: 'g', round: 'protein'},
        204: {id: 204, name: 'Fat', unit: 'g', round: 'total_fat'}
      },
      primaryNutrient:  null
    };

    vm.drag = {
      placeholder: null,
      dropAccepts: function (food, mealType) {
        let accepts      = mealType && mealType !== 4 && food.meal_type !== mealType;
        this.placeholder = accepts ? mealType : null;
        return accepts;
      },
      onDrop:      function ($event, food, mealType) {
        food.meal_type = mealType;

        nixTrackApiClient.log.update(food);

        this.leave();
      },
      enter:       function ($event, $food, mealType) {
        this.placeholder = mealType;
      },
      leave:       function () {
        this.placeholder = null;
      },
      moveDay:     function ($event, food, when) {
        food.consumed_at = moment(food.consumed_at).add(when === 'tomorrow' ? 1 : -1, 'day').format();

        nixTrackApiClient.log.update(food)
          .success(() => {
            $rootScope.$broadcast('track:foods-updated');
          });

        this.leave();
      },
      highlightDay: function(day) {
        this.placeholder = day;
        return true;
      }
    };

    if (!me.default_nutrient) {
      me.default_nutrient       = 208;
      me.default_nutrient_value = me.daily_kcal || 2000;
    }

    if (me.default_nutrient === 208 && me.daily_kcal) {
      me.default_nutrient_value = me.daily_kcal;
    }

    if (!me.default_nutrient_value) {
      me.default_nutrient_value = 2000;
    }

    vm.primaryNutrient = vm.dailyIntake.primaryNutrient = vm.dailyIntake.primaryNutrients[me.default_nutrient];


    vm.measureSystem          = user.get('measure_system');
    vm.weightUnit             = vm.measureSystem ? 'kg' : 'lb';

    vm.loadLogs();

    if ($sessionStorage.sharedFood) {
      nixTrackApiClient(`/share/food/${$sessionStorage.sharedFood.ufl}/${$sessionStorage.sharedFood.s}`)
        .then(response => {
          reviewFoodsBasket.push(response.data.foods);
          reviewFoodsBasket.openModal();

          $sessionStorage.sharedFood = undefined;
        })
    }

    $scope.$watch(
      () => $state.params.date,
      (newVal, oldVal) => {
        if(newVal !== oldVal){
          vm.loadLogs();
          vm.dietGraphApi && vm.dietGraphApi.jumpTo(newVal);
        }
      }
    );

    $scope.$watch(
      () => vm.viewDate && vm.viewDate.format(vm.dateFormat),
      date => {
        if (date != vm.today.format(vm.dateFormat)) {
          $state.go('account.cabinet.dashboard.date', {date});
        } else {
          $state.go('account.cabinet.dashboard');
        }
      }
    );
  }
})();

