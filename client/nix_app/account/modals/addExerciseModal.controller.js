(function () {
  'use strict';

  angular
    .module('account')
    .controller('addExerciseModalCtrl', addExerciseModalCtrl);

  function addExerciseModalCtrl($rootScope, $scope, $modalInstance,
                                nixTrackApiClient, $q, date, exercise, confirm, $timeout) {
    var vm = $scope.vm = this;

    vm.edit = exercise;

    vm.exercises = exercise ? `${exercise.duration_min} min ${exercise.name}` : '';

    if (!vm.edit) {
      nixTrackApiClient('/exercise/log')
        .then(response => {
          vm.recent = _.uniq(
            response.data.exercises
              .map(e => `${e.duration_min} min ${e.name}`)
          ).slice(0, 3);
        })
    }

    vm.submit = (exercises = null) => {
      vm.submit.$error = null;
      vm.submit.$busy = true;

      if (exercises) {
        vm.exercises = exercises;
      }

      if (vm.exercises) {
        nixTrackApiClient('/natural/exercise', {
          method: 'POST',
          data:   {query: vm.exercises}
        })
          .then(response => response.data.exercises)
          .then(exercises => {
            if (!exercises.length) {
              return $q.reject({message: 'No exercises could be parsed from your query'})
            }

            exercises.forEach(exercise => {
              exercise.timestamp = date.format();
            });

            let create = $q.resolve();
            let update = $q.resolve();

            if (vm.edit) {
              let updatedInstance       = exercises[0];
              updatedInstance.id        = vm.edit.id;
              updatedInstance.timestamp = vm.edit.timestamp;

              update = nixTrackApiClient('/exercise/log', {
                method: 'PUT',
                data:   {exercises: [updatedInstance]}
              });


              exercises = exercises.slice(1);
            }

            if (exercises.length) {
              create = nixTrackApiClient('/exercise/log', {
                method: 'POST',
                data:   {exercises}
              });
            }

            return $q.all([update, create]);
          })
          .then(() => {
            $rootScope.$broadcast('track:exercise-saved');
            $modalInstance.close();
          })
          .catch(error => {
            vm.$error = error.data || error;
          })
          .finally(() => vm.submit.$busy = true);
      }
    };

    vm.close = () => {$modalInstance.dismiss();};

    vm.delete = () => {
      if (!vm.edit) {return;}
      vm.$error = null;
      confirm('Are you sure you want to delete this record?')
        .then(() => {
          nixTrackApiClient('/exercise/log', {
            method: 'DELETE',
            data:   {
              exercises: [{id: vm.edit.id}]
            }
          })
            .then(() => {
              $rootScope.$broadcast('track:exercise-deleted');
              $modalInstance.close();
            })
            .catch(error => {
              vm.$error = error.data || error;
            });
        })
    };

    $timeout(() => vm.focus = true, 300);
  }
})();
