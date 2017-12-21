(function () {
  'use strict';

  angular
    .module('exercise', ['nutritionix', 'hc.marked'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.exerciseDetail', {
      url:         '/exercise/:exercise',
      metaTags:    {
        title:       'Nutritionix - Exercise Info',
        description: 'Nutritionix - Exercise Info'
      },
      controller:  'ExerciseCtrl',
      resolve:     {
        exercise: function ($stateParams, nixTrackApiClient) {
          const query = $stateParams.exercise.replace(/-/g, ' ');

          return nixTrackApiClient('/natural/exercise', {method: 'POST', data: {query}, ignore500: true})
            .then(response => {
              return response.data.exercises[0];
            })
            .catch(response => null)
        }
      },
      templateUrl: baseUrl + '/nix_app/exercise/exercise.detail.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      },
      data:        {
        cssClass: 'page-detail'
      }
    });
  }
})();
