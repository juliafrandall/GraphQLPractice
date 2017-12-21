(function () {
  'use strict';

  angular
    .module('businessApi')
    .controller('businessApiCtrl', BusinessApiCtrl);

  function BusinessApiCtrl($scope, $http, vcRecaptchaService, Analytics, $timeout, stats, $filter, InstantSmartSearch) {
    const vm = $scope.vm = this;

    vm.subscribeForm = vm.contactForm = null;

    vm.initModel = () => {
      vm.model = {
        subject: '',
        name:    '',
        email:   '',
        phone:   '',
        message: ''
      };
    };

    vm.initModel();

    vm.recaptcha = {
      response: null,
      widgetId: null
    };

    vm.instantSmartSearch                      = new InstantSmartSearch();
    vm.instantSmartSearch.enableFreeform       = false;
    vm.instantSmartSearch.showCounters         = false;
    vm.instantSmartSearch.enableSuggestedFoods = false;
    vm.instantSmartSearch.sources.self         = false;
    vm.instantSmartSearch.limits.branded       = 5;
    vm.instantSmartSearch.select               = function () {
      this.selected = null;
      this.error    = null;
    };

    vm.contact = () => {
      Analytics.trackEvent('button', 'click', 'contact');

      vm.contact.$error = vm.contact.$success = null;
      vm.contactForm.$submitted = true;

      if (vm.contactForm.$valid) {
        vm.contact.$busy = true;

        $http.post('/email/secure', {
            message:   `
              From: ${vm.model.name} <${vm.model.email}>
              Message: ${vm.model.message}
            `.split('\n').map(r => r.trim()).join('\n'),
            name:      vm.model.name,
            subject:   'Nutrition & Exercise API contact form',
            email:     vm.model.email,
            recaptcha: vm.recaptcha.response,
            inquiry:   "api"
          }, {ignore500: true})
          .then(function () {
            vm.initModel();
            vm.contact.$success = "We'll be in contact shortly!";
            vm.contactForm.$setPristine();
          })
          .catch(function (response) {
            if (angular.isString(response.data)) {
              vm.contact.$error = response.data;
            } else if (angular.isObject(response.data) && response.data.message) {
              vm.contact.$error = response.data.message;
            } else {
              vm.contact.$error = 'Unexpected backend error';
            }
          })
          .finally(() => {
            vm.contactForm.$submitted = null;
            vcRecaptchaService.reload(vm.recaptcha.widgetId);
            vm.contact.$busy = false;
          })
      } else {
        angular.forEach(vm.contactForm, function (property, key) {
          if (key[0] !== '$' && property.$invalid) {
            property.$setDirty();
          }
        });
      }
    };

    vm.planInclusive = [{
      name:        'Natural Language',
      description: `Turn spoken text into precise nutrition analysis with our state-of-the-art 
                    natural language functionality.`,
      icon:        '<i class="fa fa-2x fa-microphone"></i>',
      linkText:    'Try a live demo!',
      link:        '/natural-demo?q=for%20breakfast%20i%20ate%203%20eggs,%20bacon%20and%20cheese'
    },
      {
        name:          'Autocomplete Search',
        description:   `Your users will love our lightning fast autocomplete search.  
                    Try a demo below:`,
        icon:          '<i class="fa fa-2x fa-bolt"></i>',
        //linkText: 'Learn More',
        link:          '#',
        extraTemplate: '/nix_app/business/api/autocomplete-demo.html'
      },
      /*
      {
          name: 'Barcode Scanning',
          description: `Cumque incidunt laudantium deserunt nulla asperiores fugiat reprehenderit
                        adipisci repudiandae autem eaque! Quod qui dolorem ducimus animi,
                        ex dicta odit error itaque.`,
          icon: '<i class="fa fa-2x fa-barcode"></i>',
          linkText: 'Learn More',
          lin*/
      {
        name:        'Common Foods',
        description: `Our registered dietitian team started with the USDA database and supercharged it! 
                     In addition to USDA foods, our team has curated thousands of common international foods and recipes.  
                     `,
        icon:        '<i class="fa fa-2x fa-cutlery"></i>',
        linkText:    'Learn More',
        link:        '/database'
      },
      {
        name:        'Branded Foods',
        description: `We have the largest branded food database in existence with over 
                      ${$filter('round')(stats.cpg_count, -3, 'K')} grocery foods with barcodes and 
                      ${$filter('round')(stats.restaurant_count, -3, 'K')} restaurant foods.`,
        icon:        '<i class="fa fa-2x fa-shopping-cart"></i>',
        linkText:    'About our Database',
        link:        '/database'
      },
      {
        name:        'Dietitian Verified',
        description: `We employ a full-time team of registered dietitians to help us 
                      verify our data and API procedures to ensure we can provide 
                      the strongest possible nutrition solution for your app.
                      `,
        icon:        '<i class="fa fa-2x fa-flask"></i>',
        //linkText: 'Learn More',
        link:        '#'
      },
      {
        name:        'Restaurant Geolocation',
        description: `Send our API a lat/long coordinate, and we will return a list of 
                      nearby restaurant locations which have nutrition data available.  
                      We have a growing database of ${$filter('number')(stats.brand_locations_count)} restaurant locations.`,
        icon:        '<i class="fa fa-2x fa-location-arrow"></i>',
        linkText:    'Try a live demo!',
        link:        '/restaurant-map'
      }
    ];


    vm.features = [
      {
        attribute: 'mau', label: 'Active Users (MAU)', tooltip: `An active user is defined as an end-user who makes
                                                                an API request within a 30 day time period.`
      },
     /*
       {attribute: 'branded', label: 'Branded Food Database', tooltip: `Includes access to the largest branded food database
                                                                         in the world, with over 600K restaurant and grocery foods.
                                                                         Includes barcode scanning lookups.`},
      */
       {attribute: 'natural', label: 'Natural Language Engine', tooltip: `Utilize our state-of-the-art natural language engine
                                                                         for parsing freeform food and exercise queries.`},


      {
        attribute: 'upc', label: 'Barcode Scanning', tooltip: `Access to the most robust food barcode database on the planet!  
                                                                  Includes over 600K UPCs linked to nutrition data, with hundreds 
                                                                  of products updated every single week. `
      },
      {
        attribute: 'location', label: 'Restaurant Geolocation API', tooltip: `Search using lat/long coordinates to
                                                                          find the nearest restaurant locations with
                                                                          nutrition information available. Over 300K US restaurant
                                                                          locations and growing!
                                                                          `
      },
      {
        attribute: 'caching', label: 'Caching Allowed', tooltip: `On plans where caching is allowed, you are permitted
                                                                to cache user food log data for historical reference
                                                                purpose only.  For example, you do not need to hit our
                                                                API to show a user their historic food log, but you
                                                                do need to hit our API to have the user lookup foods
                                                                to log in the future.`
      },
      {
        attribute: 'db', label: 'Request Database Additions', tooltip: `Request custom foods to be added to our natural
                                                                      language engine or branded food database.`
      },
      {
        attribute: 'attrib', label: 'Attribution Requirement', tooltip: `We require \"Powered by Nutritionix\" 
                                                                          Attribution on any interface which hits our API.
                                                                          Requirement does not include interfaces which show historical 
                                                                          user food logs.`
      },
      /*{attribute: 'freemium', label: 'Freemium App Support', tooltip: `Do you have a free tier in your app?  Contact us to
                                                                        discuss our freemium plan, which allows you to pay
                                                                        a flat rate for all of your free tier users.`}, */
      /*
      {attribute: 'commercial', label: 'Commercial Use', tooltip: `Non-commerical applications include student projects,
                                                                  hackathons, or personal use projects.  Any applications that
                                                                  do not fall into aforementioned list are considered commercial.`},
      */
      {attribute: 'support', label: 'Support'},
      {attribute: 'sla', label: 'Uptime Guarantee (SLA)'}

    ];

    vm.plans = [
      {
        'name':         'Hacker',
        'price':        'FREE',
        'headingClass': 'free',
        'term':         '/Month',
        'features':     {
          mau:        'up to 10',
          caching:    '<i class="fa fa-2x fa-times"></i>',
          support:    '<i class="fa fa-2x fa-times"></i>',
          db:         '<i class="fa fa-2x fa-times"></i>',
          sla:        '<i class="fa fa-2x fa-times"></i>',
          commercial: '<i class="fa fa-2x fa-times"></i>',
          natural:    '<i class="fa fa-2x fa-check"></i>',
          branded:    '<i class="fa fa-2x fa-check"></i>',
          location:   '<i class="fa fa-2x fa-times"></i>',
          freemium:   '<i class="fa fa-2x fa-times"></i>',
          attrib:     'Required',
          upc:        '<i class="fa fa-2x fa-check"></i>'
        },
        'buttonText':   'Get your API Key',
        'buttonLink':   'https://developer.nutritionix.com/signup'
      },
      {
        'name':       'Starter',
        'price':      `
          <sup>$</sup>299
          <sub>/Month</sub>`,
        'features':   {
          mau:        'up to 200',
          caching:    '<i class="fa fa-2x fa-times"></i>',
          support:    'Email',
          db:         '<i class="fa fa-2x fa-times"></i>',
          sla:        '99.9%',
          commercial: '<i class="fa fa-2x fa-check"></i>',
          natural:    '<i class="fa fa-2x fa-check"></i>',
          branded:    '<i class="fa fa-2x fa-check"></i>',
          location:   '<i class="fa fa-2x fa-times"></i>',
          freemium:   '<i class="fa fa-2x fa-times"></i>',
          attrib:     'Required',
          upc:        '<i class="fa fa-2x fa-check"></i>'
        },
        'buttonText': 'Sign Up Now',
        'buttonLink': 'https://payment.nutritionix.com/'
      },
      {
        'name':       'MVP',
        'price':      `
          <sup>$</sup>499
          <sub>/Month</sub>`,
        'features':   {
          mau:        'up to 1000',
          caching:    '<i class="fa fa-2x fa-check"></i>',
          support:    'Email',
          db:         '<i class="fa fa-2x fa-times"></i>',
          sla:        '99.9%',
          commercial: '<i class="fa fa-2x fa-check"></i>',
          natural:    '<i class="fa fa-2x fa-check"></i>',
          branded:    '<i class="fa fa-2x fa-check"></i>',
          location:   '<i class="fa fa-2x fa-check"></i>',
          freemium:   '<i class="fa fa-2x fa-times"></i>',
          attrib:     'Required',
          upc:        '<i class="fa fa-2x fa-check"></i>'
        },
        'buttonText': 'Sign Up Now',
        'buttonLink': 'https://payment.nutritionix.com/'
      },
      {
        'name':       'Unicorn',
        'price':      `
          <span>plans as low as</span>
          <sup>$</sup>0.15
          <sub>user/month</sub>`,
        'term':       'user/month',
        'features':   {
          mau:        '1000+',
          caching:    '<i class="fa fa-2x fa-check"></i>',
          support:    'Email + Phone',
          db:         '<i class="fa fa-2x fa-check"></i>',
          sla:        '99.9%',
          commercial: '<i class="fa fa-2x fa-check"></i>',
          natural:    '<i class="fa fa-2x fa-check"></i>',
          branded:    '<i class="fa fa-2x fa-check"></i>',
          location:   '<i class="fa fa-2x fa-check"></i>',
          freemium:   '<i class="fa fa-2x fa-check"></i>',
          attrib:     'Removable Option',
          upc:        '<i class="fa fa-2x fa-check"></i>'
        },
        'buttonText': 'Contact Us',
        'buttonLink': '#contact-form'
      }
    ];
  }
})();
