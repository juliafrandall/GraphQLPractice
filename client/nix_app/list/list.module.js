(function () {
  'use strict';

  angular
    .module('list', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    const userExtraData = {
      aX8jgWK6e9bVkJP: {
        user_name:         'Paige Einstein, RD',
        user_photo:        'https://s3.amazonaws.com/cdn4-nutritionix/images/paige.jpg',
        user_profile_link: '/about'
      },
      Jq0NxWz1Nx9LgXm: {
        user_name:         'Janna dePorter, MS, RD',
        user_photo:        'https://s3.amazonaws.com/cdn4-nutritionix/images/janna.jpg',
        user_profile_link: '/about'
      }
    };

    function postProcessList(list) {
      list.user_name = list.user_first_name || '';

      if (list.user_last_name) {
        list.user_name += ' ' + list.user_last_name[0] + '.';
      }

      list.user_name = list.user_name.trim().replace(/^([a-z])|\s+([a-z])/g, $1 => $1.toUpperCase());

      if (userExtraData[list.user_id]) {
        _.extend(list, userExtraData[list.user_id]);
      }

      if (list.photo) {
        _.forEach(list.photo, (value, key) => {
          list.photo[key] = list.photo[key].replace(
            'https://nix-track-uploads-live-prod.s3.amazonaws.com',
            'https://d1mwdn9ajtxwtg.cloudfront.net'
          );
        });
      }

      return list;
    }

    $stateProvider.state('site.listIndex', {
      url:         '/lists',
      metaTags:    {
        title:       'Nutritionix - Public Lists',
        description: '{{list.description || list.name}}'
      },
      templateUrl: '/nix_app/list/list.index.html',
      controller:  'ListIndexCtrl as vm',
      resolve:     {
        lists: $http => $http.get('/nixapi/public_lists')
          .then(response => response.data.map(postProcessList))
          .catch(() => [])
      },
      onEnter:     $anchorScroll => $anchorScroll()
    });

    $stateProvider.state('site.listDetail', {
      url:         '/list/:name/:id',
      metaTags:    {
        title:       '{{list.name}}',
        description: '{{list.description || list.name}}',
        properties:  {
          'og:type':             'article',
          'og:image':            '{{list.photo.highres}}',
          'og:image:secure_url': '{{list.photo.highres}}',
          'og:image:width':      '1200',
          'og:image:height ':    '630',
          'twitter:image':       '{{list.photo.highres}}'
        }
      },
      templateUrl: baseUrl + '/nix_app/list/list.detail.html',
      controller:  'ListDetailCtrl as vm',
      resolve:     {
        list: function (nixTrackApiClient, $stateParams, $state, listLabelsService) {
          return nixTrackApiClient(`/public_lists/${$stateParams.id}`, {ignore401: true})
            .then(response => listLabelsService.updateListLabelData(postProcessList(response.data)))
            .catch(() => $state.go('site.404'));
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();

      },
      data:        {
        cssClass: 'page-detail'
      }
    });
  }
})();
