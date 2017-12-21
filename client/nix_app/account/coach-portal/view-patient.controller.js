(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  angular
    .module(moduleName)
    .controller(`${moduleName}.ViewPatientCtrl`, ViewPatientCtrl);

  /* @ngInject */
  function ViewPatientCtrl($scope, $state, nixTrackApiClient, moment, $q) {
    const vm = $scope.vm = this;
    vm.dateFormat = 'YYYY-MM-DD';

    let begin = moment().subtract('1', 'month').startOf('month').format(vm.dateFormat);

    $q.all([
        nixTrackApiClient('/share/patients').then(response => response.data.patients[$state.params.id]),
        nixTrackApiClient(`/reports/totals/${$state.params.id}`, {params: {begin}}).then(response => response.data.dates),
        (function fetch(foods = [], limit = 300, offset = 0) {
          return nixTrackApiClient(`/log/${$state.params.id}`, {params: {begin, limit, offset}})
            .then(response => {
              foods = foods.concat(response.data.foods);

              if (response.data.foods.length === limit) {
                return fetch(foods, limit, offset + limit);
              }

              response.data.foods = foods;

              return response;
            });
        }()).then(response => response.data.foods)
      ])
      .then(responses => {
        let totals = responses[1];

        vm.patient      = responses[0];
        vm.patient.name = [vm.patient.last_name, vm.patient.first_name]
          .filter(v => !!((v || '').trim()))
          .join(', ').trim();

        vm.patient.age = parseInt(moment().format('YYYY') - vm.patient.birth_year);

        vm.totals = responses[2].reduce((acc, food) => {
          let date = moment.tz(food.consumed_at, vm.patient.timezone).format(vm.dateFormat);

          acc[date] = _.merge(
            acc[date] || {},
            _.pick(food, ['nf_calories', 'nf_protein', 'nf_total_carbohydrate', 'nf_total_fat']),
            (a, b) => (a || 0) + (b || 0)
          );

          return acc;
        }, {});

        vm.dates           = _.sortBy(_.keys(vm.totals)).reverse();
        let startOfWeek    = moment().startOf('week').format(vm.dateFormat);
        vm.weekDaysTracked = vm.dates.filter(date => date >= startOfWeek && vm.totals[date].nf_calories > 0).length;

        _.forEach(vm.totals, (total, date) => {
          let dayTotal = _.find(totals, {date});
          if (!dayTotal) {
            dayTotal = {
              daily_kcal_limit: vm.patient.daily_kcal || 2000,
              total_cal_burned: 0
            };
          }

          _.extend(total, dayTotal);

          total.remaining_calories = total.daily_kcal_limit + total.total_cal_burned - total.nf_calories;
          total.progress           = total.remaining_calories > 0 ?
            _.round(100 - total.remaining_calories / total.daily_kcal_limit * 100) :
            100;

          if (total.progress > 99) {
            total.progressColor = 'danger';
          } else if (total.progress > 95) {
            total.progressColor = 'warning';
          } else {
            total.progressColor = 'success';
          }
        });
      })
  }
})();
