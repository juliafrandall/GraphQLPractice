(function () {
  'use strict';

  const moduleName = 'account.coach-portal';

  const state      = state => `account.cabinet.coach-portal${state ? '.' + state : ''}`;
  const controller = controller => `${moduleName}.${controller}`;
  const template   = template => `/nix_app/account/coach-portal/${template}`;

  angular.module(moduleName, [])
    .config(config)
    .run(run);

  function config($stateProvider) {
    $stateProvider
      .state(state(), {
        url:      '/track/coach-portal',
        abstract: true,
        template: '<div ui-view></div>'
      })
      .state(state('dashboard'), {
        url:         '',
        metaTags:    {
          title: "Track - Coach Portal"
        },
        controller:  controller('CoachPortalCtrl'),
        templateUrl: template('coach-portal.html')
      })
      .state(state('view-patient'), {
        url:         '/view-patient/:id',
        metaTags:    {
          title: 'Track - View Patient'
        },
        controller:  controller('ViewPatientCtrl'),
        templateUrl: template('view-patient.html')
      })
      .state(state('view-patient-day'), {
        url:         '/view-patient/:patient_id/:date',
        metaTags:    {
          title: 'Track - View Patient - Daily Log'
        },
        controller:  controller('ViewPatientDayCtrl'),
        templateUrl: template('view-patient-day.html'),
        resolve:     {
          patient: (nixTrackApiClient, $stateParams) => nixTrackApiClient('/share/patients')
            .then(response => response.data.patients[$stateParams.patient_id])
        }
      })
      .state(state('enable-sharing'), {
        url:         '/enable-sharing',
        metaTags:    {
          title: 'Track - Enable Sharing'
        },
        controller:  controller('EnableSharingCtrl'),
        templateUrl: template('enable-sharing.html')
      })
      .state(state('subscribe'), {
        url:         '/subscribe',
        metaTags:    {
          title: 'Track - Subscribe'
        },
        controller:  controller('SubscribeCtrl'),
        templateUrl: template('subscribe.html')
      })
  }


  function run($state, $rootScope, user) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      let coachStates = ['dashboard', 'view-patient'].map(state);

      if (coachStates.indexOf(toState.name) > -1 && !user.get('isCoach')) {
        event.preventDefault();
        $state.go(state('enable-sharing'));
      }
    });
  }
}());
