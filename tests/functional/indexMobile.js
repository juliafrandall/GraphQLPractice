'use strict';

define([
    'node_modules/intern/browser_modules/dojo/node!fs',
    'intern',
    'intern!object',
    'intern/chai!assert',
    '../support/pages/IndexPage',
    '../support/pages/ConsumerToolsPage',
    '../support/pages/NutritionInfoPage',
    '../support/pages/ContactPage'
], function(fs, intern, registerSuite, assert, IndexPage, ConsumerToolsPage, NutritionInfoPage, ContactPage) {
    registerSuite(function() {

        var indexPage;
        var consumerToolsPage;
        var nutritionInfoPage;
        var contactPage;

        var config = { // TODO: create a config module which will be imported in Page Objects instead of pass it as parameter to it
            baseUrl: intern.args.base_url,
            width: 980,
            heigth: 1280,
            maxTimeout: 900000,
            maxFindTimeout: 60000,
            maxSleepTime: 3000,
            mobileDevice: true
        };

        var counter = -1;
        var path = '/src/tests/screenshots/'; // TODO: use a relative path

        fs.exists('test-results-meta.json', function (exists) {
            if (exists) {
                fs.unlink('test-results-meta.json', function(err) {
                    if (err) {
                        // console.log('ERROR: ', err);
                    }
                });
            } else {
                // Add some code here!
            }
        });

        return {
            setup: function() {
                indexPage = new IndexPage(this.remote);
                consumerToolsPage = new ConsumerToolsPage(this.remote);
                nutritionInfoPage = new NutritionInfoPage(this.remote);
                contactPage = new ContactPage(this.remote);
            },

            beforeEach: function() {
                counter++;
                this.timeout = config.maxTimeout;
                this.parent._timeout = 45000;

                if (this.parent.name.indexOf('iphone') >= 0) {
                    config.mobileDevice = true;
                } else {
                    config.mobileDevice = false;
                }
            },

            afterEach: function() {
                var finishedTest = this.tests.filter(function(i){return i.timeElapsed != null});
                var currentTest = finishedTest[finishedTest.length-1];

                this.remote
                  .getCurrentUrl()
                  .then(function(url) {
                      var test = {};

                      fs.exists('test-results-meta.json', function (exists) {
                          function updateMeta() {
                              test[currentTest.id] = {
                                  lastURL: url
                              };

                              fs.writeFile('test-results-meta.json', JSON.stringify(test), function(err) {
                                  if (err) {
                                      console.log('ERROR: ', err);
                                  }
                              });
                          }

                          if (exists) {
                              fs.readFile('test-results-meta.json', function(err, data) {
                                  if (!err) {
                                      try {
                                          test = JSON.parse(data);
                                          updateMeta();
                                      } catch(err){
                                          console.log('ERROR: ' + err);
                                      }
                                  } else {
                                      console.log(err);
                                  }
                              });
                          } else {
                              updateMeta();
                          }
                      });
                  })

                var currentTest = this.tests[counter];
                if (!currentTest.error) {
                    return;
                }
                this.remote
                    .takeScreenshot()
                    .then(function(buffer) {
                        console.log('takenScreenshot');
                        if (!fs.existsSync(path)) {
                            fs.mkdirSync(path);
                            console.log('created: ', path);
                        }
                        fs.writeFileSync(path + currentTest.name + '_' + counter + '.png', buffer);
                    });
            },


            /**
             * Home Page
             */
            'navigable top menu': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return indexPage
                        .topMenu(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'Top menu should be navigable');
                        });
                }
            },
            'navigable bottom menu': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return indexPage
                        .bottomMenu(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'Bottom menu should be navigable');
                        });
                }
            },
            // 'usable search box(mobile)': function() {
            //     if (config.mobileDevice != true) {
            //         this.skip('mobile-only test');
            //     } else {
            //         var foodName = 'wine';
            //
            //         return indexPage
            //             .searchFoodMobile(config, foodName)
            //             .then(function(bool) {
            //                 assert.isTrue(bool,
            //                     'Search results list should be populated');
            //             });
            //     }
            // },


            /**
             * Nutritional Information
             */
            'accurated nutrition label': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    var minCalories = 100;
                    var maxCalories = 150;

                    return nutritionInfoPage
                        .caloriesRange(config, minCalories, maxCalories)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'Calories should be between ' + minCalories + ' and ' + maxCalories);
                        });
                }
            },
            'view item page::restaurant item': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    var minCalories = 1;

                    return nutritionInfoPage
                        .restaurantItem(config, minCalories)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'view item page - restaurant item should be navigable');
                        });
                }
            },
            'view item page::USDA item with tag': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    var minCalories = 1;

                    return nutritionInfoPage
                        .USDAItemWithTag(config, minCalories)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'view item page - USDA item with tag should be navigable');
                        });
                }
            },
            'view item page::USDA item without tag': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    var minCalories = 1;

                    return nutritionInfoPage
                        .USDAItemWithoutTag(config, minCalories)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'view item page - USDA item without tag be navigable');
                        });
                }
            },
            'view item page::grocery item with tag': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                  var minCalories = 1;

                  return nutritionInfoPage
                      .GroceryItemWithTag(config, minCalories)
                      .then(function(bool) {
                          assert.isTrue(bool,
                              'view item page - grocery item with tag should be navigable');
                      });
                }
            },
            'view item page::grocery item without tag': function() {
              if (config.mobileDevice != true) {
                  this.skip('mobile-only test');
              } else {
                  var minCalories = 1;

                  return nutritionInfoPage
                      .GroceryItemWithoutTag(config, minCalories)
                      .then(function(bool) {
                          assert.isTrue(bool,
                              'view item page - grocery item without tag should be navigable');
                      });
              }
            },
            'view item page::recipe based USDA item': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    var minCalories = 1;

                    return nutritionInfoPage
                        .RecipeBasedUSDAItem(config, minCalories)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'view item page - recipe based USDA item should be navigable');
                        });
                }
            },
            '404 item page(mobile)': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return nutritionInfoPage
                        .GroceryItem404(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                '404 item page top have correct error page');
                        });
                }
            },


            /**
             * Contact Form
             */
            'usable contact form(mobile)': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return contactPage
                        .sendMessageMobile(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                'Contact form should be accesible');
                        });
                }
            },


            /**
             * Consumer Tools
             */
             'track app page': function() {
                 if (config.mobileDevice != true) {
                     this.skip('mobile-only test');
                 } else {
                     return consumerToolsPage
                         .trackAppMobile(config)
                         .then(function(bool) {
                             assert.isTrue(bool,
                                 'Track App page should be navigable');
                         });
                 }
             },
            'navigable popular foods(mobile)': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return consumerToolsPage
                        .popularFoodsMobile(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                '"Popular Food" tool should be navigable');
                        });
                }
            },
            'daily calories calculator': function() {
              if (config.mobileDevice != true) {
                  this.skip('mobile-only test');
              } else {
                  return consumerToolsPage
                      .dailyCaloriesCalculatorMobile(config)
                      .then(function(bool) {
                          assert.isTrue(bool,
                              '"Calculate Daily Calories" tool should be navigable');
                      });
              }
            },
            'navigable search engine(mobile)': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return consumerToolsPage
                        .searchEngineMobile(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                '"Search Engine" tool should be navigable');
                        });
                }
            },
            'navigable nutrition calculators(mobile)': function() {
                if (config.mobileDevice != true) {
                    this.skip('mobile-only test');
                } else {
                    return consumerToolsPage
                        .nutritionCalculatorsMobile(config)
                        .then(function(bool) {
                            assert.isTrue(bool,
                                '"Nutrition Calculator" tool should be navigable');
                        });
                }
            },
        };
    });
});
