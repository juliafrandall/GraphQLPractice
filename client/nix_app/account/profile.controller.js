(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountProfileCtrl', AccountProfileCtrl);

  function AccountProfileCtrl($scope, user, nixTrackApiClient, moment, $q) {
    const vm = $scope.vm = this;

    vm.timezones = moment.tz.names();

    vm.profile = _.merge(
      _.pick(user.getUserProfile(), ['first_name', 'last_name', 'timezone']),
      {
        password:    '',
        oldPassword: '',
      }
    );
    if (!vm.profile.timezone) {
      vm.profile.timezone = moment.tz.guess();
    }

    vm.weight = {
      kg: null,
      lb: null
    };
    vm.height = {
      cm:   null,
      ft:   null,
      inch: null
    };

    vm.submit = function () {
      vm.submit.$success = null;
      vm.submit.$error = null;

      if (vm.form && vm.form.$invalid) {return false;}

      let profile = angular.copy(vm.profile);

      let flow;

      if (profile.password) {
        flow = nixTrackApiClient.auth.updatePassword.set({
          password:    profile.password,
          oldPassword: profile.oldPassword
        })
      } else {
        flow = $q.resolve(true);
      }

      delete profile.password;
      delete profile.oldPassword;

      profile = angular.merge(profile, {
        height_cm:      (vm.unitSystem === 'imperial' ? (vm.height.ft || 0) * 30.48 + (vm.height.inch || 0) * 2.54 : vm.height.cm) || null,
        weight_kg:      (vm.unitSystem === 'imperial' ? vm.weight.lb * 0.453592 : vm.weight.kg) || null,
        birth_year:     vm.age ? moment().utc().format('YYYY') - vm.age : null,
        gender:         vm.gender || null,
        measure_system: vm.unitSystem === 'imperial' ? 0 : 1,
        last_name:      profile.last_name || null
      });

      flow
        .then(() => {
          return nixTrackApiClient.me.preferences(profile)
            .success(function (data) {
              vm.submit.$success = true;
              user.setUserProfile(data);
            });
        })
        .catch(function (response) {
          let error = vm.submit.$error = response.data;
          error.code = error.message.indexOf('account already exists') > -1 ? 409 : response.code;
        })
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

          if (_.round(vm.height.inch) === 12) {
            vm.height.ft += 1;
            vm.height.inch = 0;
          }
        } else {
          vm.height.ft = 0;
        }
      } else {
        vm.height.cm = (vm.height.ft || 0) * 30.48 + (vm.height.inch || 0) * 2.54;
      }

      _.each(vm.height, (value, key) => vm.height[key] = value === null ? null : (_.round(value) || 0));
    };

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

    vm.calculateHeights('metric');
    vm.calculateWeights('metric');
  }
})();
