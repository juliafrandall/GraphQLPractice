(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  angular
    .module(moduleName)
    .controller(`${moduleName}.ViewPatientDayCtrl`, ViewPatientDayCtrl);

  /* @ngInject */
  function ViewPatientDayCtrl($scope, $state, nixTrackApiClient, moment, $q, patient, $filter, user, $modal) {
    const vm = $scope.vm = this;
    vm.patient = patient;

    vm.measureSystem = user.get('measure_system');
    vm.weightUnit    = vm.measureSystem ? 'kg' : 'lb';

    vm.dateFormat     = 'YYYY-MM-DD';
    vm.dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

    vm.today    = moment().startOf('day');
    vm.viewDate = moment($state.params.date);

    vm.foods     = [];
    vm.weights   = [];
    vm.exercises = [];

    vm.goals = _.pick(patient, ['daily_kcal', 'daily_fat_pct', 'daily_protein_pct', 'daily_carbs_pct']);

    let begin = vm.viewDate.format(vm.dateTimeFormat);
    let end   = vm.viewDate.clone().endOf('day').format(vm.dateTimeFormat);

    let promises = [];

    function getIsVisible() {
      for (let i = 0; i < vm.foods.length; i += 1) {
        if (vm.foods[i].meal_type === this.type) {return true;}
      }

      return false;
    }

    vm.getHasSnack = function () {
      for (let i in vm.foods) {
        let mealType = vm.foods[i].meal_type;
        if (mealType === 2 || mealType === 4 || mealType === 6) { return true; }
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

    vm.go = {
      today: () => {
        $state.go('account.cabinet.coach-portal.view-patient-day', {
          patient_id: $state.params.patient_id,
          date:       vm.today.format(vm.dateFormat)
        });
      },
      next:  () => {
        $state.go('account.cabinet.coach-portal.view-patient-day', {
          patient_id: $state.params.patient_id,
          date:       vm.viewDate.add(1, 'day').format(vm.dateFormat)
        });
      },
      prev:  () => {
        $state.go('account.cabinet.coach-portal.view-patient-day', {
          patient_id: $state.params.patient_id,
          date:       vm.viewDate.subtract(1, 'day').format(vm.dateFormat)
        });
      }
    };

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

    $q.all(promises)
      .then(() => {
        vm.dailyTotalModal = function (mealType) {
          $modal.open({
            animation:   true,
            controller:  'dailyTotalModalCtrl',
            size:        'label',
            templateUrl: '/nix_app/account/coach-portal/modals/dailyTotalModal.html',
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

        vm.viewFoodModal = function (food) {
          $modal.open({
            animation:   true,
            controller:  function($scope, $modalInstance, parentVm){
              const vm = $scope.vm = this;
              vm.food = food;
              vm.labelData = $filter('trackFoodToLabelData')(vm.food, {
                showAmountPerServing:           false,
                showItemName:                   false,
                showServingUnitQuantity:        false,
                showServingUnitQuantityTextbox: false,
                showTransFat:                   false,
                valuePhosphorus:                $filter('nutrient')(vm.food.full_nutrients, 305, 'value'),
                caffeine:                       $filter('nutrient')(vm.food.full_nutrients, 262, 'value'),
                vitamin_d:                      $filter('nutrient')(vm.food.full_nutrients, 324, 'value'),
                vitamin_e:                      $filter('nutrient')(vm.food.full_nutrients, 323, 'value'),
                vitamin_k:                      $filter('nutrient')(vm.food.full_nutrients, 430, 'value'),
                thiamine:                       $filter('nutrient')(vm.food.full_nutrients, 404, 'value'),
                riboflavin:                     $filter('nutrient')(vm.food.full_nutrients, 405, 'value'),
                niacin:                         $filter('nutrient')(vm.food.full_nutrients, 406, 'value'),
                pantothenic_acid:               $filter('nutrient')(vm.food.full_nutrients, 410, 'value'),
                vitamin_b6:                     $filter('nutrient')(vm.food.full_nutrients, 415, 'value'),
                vitamin_b12:                    $filter('nutrient')(vm.food.full_nutrients, 418, 'value'),
                folic_acid:                     $filter('nutrient')(vm.food.full_nutrients, 431, 'value'),
                zinc:                           $filter('nutrient')(vm.food.full_nutrients, 430, 'value'),
                magnesium:                      $filter('nutrient')(vm.food.full_nutrients, 304, 'value')
              });
              vm.meal = _.find(parentVm.meals, {type: food.meal_type}).label;

              vm.close = function () {
                $modalInstance.dismiss();
              };

            },
            size:        'edit-food',
            templateUrl: '/nix_app/account/coach-portal/modals/viewFoodModal.html',
            resolve: {
              parentVm: () => vm
            }
          });
        };
      });

    vm.stats.reset();

    // load totals metadata for the day
    promises.push(nixTrackApiClient(`/reports/totals/${$state.params.patient_id}`, {params: {begin, end}})
      .then(response => response.data.dates));
    //load foo log
    promises.push((function fetch(foods = [], limit = 300, offset = 0) {
      return nixTrackApiClient(`/log/${$state.params.patient_id}`, {
        params: {
          begin,
          end,
          limit,
          offset,
          timezone: vm.patient.timezone
        }
      })
        .then(response => {
          foods = foods.concat(response.data.foods);

          if (response.data.foods.length === limit) {
            return fetch(foods, limit, offset + limit);
          }

          response.data.foods = _.unique(foods, f => f.id);

          return response;
        });
    }()).then(response => vm.foods = response.data.foods));

    nixTrackApiClient(`/weight/log/${$state.params.patient_id}`, {
      params: {
        begin,
        end,
        limit:    300,
        offset:   0,
        timezone: vm.patient.timezone
      }
    }).then(response => vm.weights = response.data.weights);

    promises.push(nixTrackApiClient(`/exercise/log/${$state.params.patient_id}`, {
      params: {
        begin,
        end,
        limit:    300,
        offset:   0,
        timezone: vm.patient.timezone
      }
    }).then(response => vm.exercises = response.data.exercises));

    $q.all(promises)
      .then(responses => {
        vm.patient.name = [vm.patient.last_name, vm.patient.first_name]
          .filter(v => !!((v || '').trim()))
          .join(', ').trim();

        vm.patient.age = parseInt(moment().format('YYYY') - vm.patient.birth_year);

        vm.totals = vm.foods.reduce((acc, food) => {
          acc = _.merge(
            acc,
            _.pick(food, ['nf_calories', 'nf_protein', 'nf_total_carbohydrate', 'nf_total_fat']),
            (a, b) => (a || 0) + (b || 0)
          );

          return acc;
        }, {
          'nf_calories':           0,
          'nf_protein':            0,
          'nf_total_carbohydrate': 0,
          'nf_total_fat':          0
        });

        vm.dates           = _.sortBy(_.keys(vm.totals)).reverse();
        let startOfWeek    = moment().startOf('week').format(vm.dateFormat);
        vm.weekDaysTracked = vm.dates.filter(date => date >= startOfWeek && vm.totals[date].nf_calories > 0).length;


        let dayTotal = responses[0][0];
        if (!dayTotal) {
          dayTotal = {
            daily_kcal_limit: vm.patient.daily_kcal || 2000,
            total_cal_burned: 0
          };
        }

        _.extend(vm.totals, dayTotal);

        vm.totals.total_cal_burned = _.sum(vm.exercises.map(e => e.nf_calories)) || 0;

        vm.totals.remaining_calories = vm.totals.daily_kcal_limit + vm.totals.total_cal_burned - vm.totals.nf_calories;
        vm.totals.progress           = vm.totals.remaining_calories > 0 ?
          _.round(100 - vm.totals.remaining_calories / vm.totals.daily_kcal_limit * 100) :
          100;

        if (vm.totals.progress > 99) {
          vm.totals.progressColor = 'danger';
        } else if (vm.totals.progress > 95) {
          vm.totals.progressColor = 'warning';
        } else {
          vm.totals.progressColor = 'success';
        }


        if (vm.totals.daily_kcal_limit) {
          vm.goals.daily_kcal = vm.totals.daily_kcal_limit;
        }

        if (!(vm.totals.daily_fat_pct === null && vm.totals.daily_protein_pct === null && vm.totals.daily_carbs_pct === null)) {
          _.assign(
            vm.goals,
            {
              daily_fat_pct:     vm.totals.daily_fat_pct,
              daily_protein_pct: vm.totals.daily_protein_pct,
              daily_carbs_pct:   vm.totals.daily_carbs_pct,
            }
          )
        }

        vm.stats.calculate();
      })
  }
})();
