'use strict';

define(['require', 'intern/chai!assert'], function(require, assert) {
    function ConsumerToolsPagex(remote) {
        this.remote = remote;
    }

    ConsumerToolsPagex.prototype = {
        constructor: ConsumerToolsPagex,

        'navButton': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        return (text==='Consumer Tools')
                    })
        },


        /**
         * Track App
         */
         'trackApp': function(config) {
             return this.remote
                 .get(require.toUrl(config.baseUrl))
                 .then(function() {
                     if (config.mobileDevice != true) {
                         this.setWindowSize(config.width, config.height);
                     }
                 })
                 .setFindTimeout(config.maxFindTimeout)

                 // Verify if 'Consumer Tools' link button exists
                 .findByCssSelector('#nav-menu li a[href="/consumer"]')
                     .getVisibleText()
                     .then(function(text) {
                         assert.strictEqual(text, 'Consumer Tools');
                     })
                     .click()
                     .waitForDeletedByCssSelector('.carousel')
                     .then()
                     .end()

                 // Verify if 'Track Mobile App' link button exists
                 .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(1) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > p.section-subtitle')
                     .getVisibleText()
                     .then(function(text) {
                         assert.isTrue(text.indexOf('Track Mobile App') > -1, 'Consumer Tools should contains a "Track Mobile App" link button');
                     })
                     .end()

                 // Go to track app details page
                 .findByCssSelector('div.consumer a[href="/app"]')
                     .click()
                     .waitForDeletedByCssSelector('a[href="/consumer/calculate-daily-calories"]')
                     .then()
                     .end()

                 // Verify Web App link
                 .findByCssSelector('a[href="/dashboard"]')
                     .end()

                 // Verify App Store link
                 .findByCssSelector('a[href="https://play.google.com/store/apps/details?id=com.nutritionix.nixtrack&hl=en"]')
                     .end()

                 // Verify Google Play link
                 .findByCssSelector('a[href="https://play.google.com/store/apps/details?id=com.nutritionix.nixtrack&hl=en"]')
                     .end()

                 // If not errors then return true
                 .then(function() {
                     return true;
                 });
         },
         'trackAppMobile': function(config) {
             return this.remote
                 .get(require.toUrl(config.baseUrl))
                 .then(function() {
                     if (config.mobileDevice != true) {
                         this.setWindowSize(config.width, config.height);
                     }
                 })
                 .setFindTimeout(config.maxFindTimeout)

                 .findByCssSelector('#navmenu-toggle')
                     .click()
                     .end()

                 // Verify if 'Consumer Tools' link button exists
                 .findByCssSelector('#nav-menu li a[href="/consumer"]')
                     .getVisibleText()
                     .then(function(text) {
                         assert.strictEqual(text, 'Consumer Tools');
                     })
                     .click()
                    //  .waitForDeletedByCssSelector('.carousel')
                     .then()
                     .end()

                 // Verify if 'Track Mobile App' link button exists
                 .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(1) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > p.section-subtitle')
                     .getVisibleText()
                     .then(function(text) {
                         assert.isTrue(text.indexOf('Track Mobile App') > -1, 'Consumer Tools should contains a "Track Mobile App" link button');
                     })
                     .end()

                 // Go to track app details page
                 .findByCssSelector('div.consumer a[href="/app"]')
                     .click()
                     .waitForDeletedByCssSelector('a[href="/consumer/calculate-daily-calories"]')
                     .then()
                     .end()

                 // Verify Web App link
                 .findByCssSelector('a[href="/dashboard"]')
                     .end()

                 // Verify App Store link
                 .findByCssSelector('a[href="https://play.google.com/store/apps/details?id=com.nutritionix.nixtrack&hl=en"]')
                     .end()

                 // Verify Google Play link
                 .findByCssSelector('a[href="https://play.google.com/store/apps/details?id=com.nutritionix.nixtrack&hl=en"]')
                     .end()

                 // If not errors then return true
                 .then(function() {
                     return true;
                 });
         },
        'popularFoods': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                // Verify if 'Consumer Tools' link button exists
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Popular Foods' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(3) > div > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Popular Foods') > -1, 'Consumer Tools should contains a "Popular Foods" link button');
                    })
                    .end()

                // Go to popular foods list
                .findByCssSelector('a[href="/grocery/category"]')
                    .click()
                    .waitForDeletedByCssSelector('a[href="/grocery/category"]')
                    .then()
                    .end()

                // Go to first listed item
                .findByCssSelector('body > div.ng-scope > div > div.container.ng-scope > table > tbody > tr:nth-child(1) > td > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div.container.ng-scope > table > tbody > tr:nth-child(1) > td > a')
                    .then()
                    .end()

                // Open first listed item
                .findByCssSelector('body > div.ng-scope > div > div.container.ng-scope > div:nth-child(3) > div > table > tbody > tr:nth-child(1) > td.text-left > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div.container.ng-scope > div:nth-child(3) > div > table > tbody > tr:nth-child(1) > td.text-left > a')
                    .then()
                    .end()

                // Verify Nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()
                .findByCssSelector('div.nutritionLabel div.calorieNote')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('* Percent Daily Values are based on a 2000 calorie diet.') > -1);
                    })
                    .end()

                // Verify Amazon referal link
                .findByCssSelector('a.amazon')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Find on Amazon');
                    })
                    .end()

                // If not errors then return true
                .then(function() {
                    return true;
                });
        },
        'popularFoodsMobile': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#navmenu-toggle')
                    .click()
                    .end()

                // Verify if 'Consumer Tools' link button exists
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Popular Foods' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(3) > div > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Popular Foods') > -1, 'Consumer Tools should contains a "Popular Foods" link button');
                    })
                    .end()

                // Go to popular foods list
                .findByCssSelector('a[href="/grocery/category"]')
                    .click()
                    .waitForDeletedByCssSelector('a[href="/grocery/category"]')
                    .then()
                    .end()

                // Go to first listed item
                .findByCssSelector('body > div.ng-scope > div > div.container.ng-scope > table > tbody > tr:nth-child(1) > td > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div.container.ng-scope > table > tbody > tr:nth-child(1) > td > a')
                    .then()
                    .end()

                // Open first listed item
                .findByCssSelector('body > div.ng-scope > div > div.container.ng-scope > div:nth-child(3) > div > table > tbody > tr:nth-child(1) > td.text-left > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div.container.ng-scope > div:nth-child(3) > div > table > tbody > tr:nth-child(1) > td.text-left > a')
                    .then()
                    .end()

                // Verify Nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()
                .findByCssSelector('div.nutritionLabel div.calorieNote')
                    .getVisibleText()
                    .then(function(text) {
                      assert.isTrue(text.indexOf('* Percent Daily Values are based on a 2000 calorie diet.') > -1);
                    })
                    .end()

                // Verify Amazon referal link
                .findByCssSelector('a.amazon')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Find on Amazon');
                    })
                    .end()

                // If not errors then return true
                .then(function() {
                    return true;
                });
        },
        'dailyCaloriesCalculator': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Calculate Daily Calories' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(1) > div:nth-child(2) > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Calculate Daily Calories') > -1, 'Consumer Tools should contains a "Calculate Daily Calories" link button');
                    })
                    .end()

                .findByCssSelector('a[href="/consumer/calculate-daily-calories"]')
                    .click()
                    .then()
                    .end()

                // TODO: Extend test to verify if fields are presents and populated

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'dailyCaloriesCalculatorMobile': function(config) {
            var sleepTime = 0;
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) { // If not running in mobile device then resize Windows
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#navmenu-toggle')
                    .click()
                    .end()

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    // .waitForDeletedByCssSelector('.carousel')
                    .end()

                  // Verify if 'Calculate Daily Calories' link button exists
                  .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(1) > div:nth-child(2) > div > p.section-subtitle')
                      .getVisibleText()
                      .then(function(text) {
                          assert.isTrue(text.indexOf('Calculate Daily Calories') > -1, 'Consumer Tools should contains a "Calculate Daily Calories" link button');
                      })
                      .end()

                  .findByCssSelector('a[href="/consumer/calculate-daily-calories"]')
                      .click()
                      .then()
                      .end()

                  // TODO: Extend test to verify if fields are presents and populated


                  // If not errors then return true;
                  .then(function() {
                      return true;
                  });
        },


        /**
         * Search Engine
         */
        'searchEngine': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Search Engine' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Search Engine') > -1, 'Consumer Tools should contains a "Search Engine" link button');
                    })
                    .end()

                // Go to search result demo
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > a')
                    .then()
                    .end()

                // View first search result item
                .findByCssSelector('ul.list-search-results > li:nth-child(1) > a')
                    .click()
                    .waitForDeletedByCssSelector('ul.list-search-results > li:nth-child(1) > a')
                    .then()
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'searchEngineMobile': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#navmenu-toggle')
                    .click()
                    .end()

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Search Engine' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Search Engine') > -1, 'Consumer Tools should contains a "Search Engine" link button');
                    })
                    .end()

                // Go to search result demo
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div.col-sm-6.col-lg-offset-1.col-lg-5 > div > a')
                    .then()
                    .end()

                // View first search result item
                .findByCssSelector('ul.list-search-results > li:nth-child(1) > a')
                    .click()
                    .waitForDeletedByCssSelector('ul.list-search-results > li:nth-child(1) > a')
                    .then()
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },



        /**
         * Nutrition Calculator
         */
        'nutritionCalculators': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each nutritionix tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()

                // Verify if 'Nutrition Calculators' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Nutrition Calculators') > -1, 'Consumer Tools should contains a "Nutrition Calculator" link button');
                    })
                    .end()

                // Go to brand lists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > a')
                    .then()
                    .end()

                // View first listed brand
                .findByCssSelector('.container-calc-brands .row a')
                    .click()
                    // .waitForDeletedByCssSelector('.container-calc-brands .row a')
                    .then()
                    .end()

                .getAllWindowHandles()
                .then(function(handles) {
                    if (handles.length>1) {
                        this
                        .switchToWindow(handles[handles.length-1])
                        .execute(function() {
                            window.name = 'nixCalc'; // Naming the window in order to switch to it later swith 'switchToWindow()'
                        });
                        return handles[1];
                    } else {
                        assert(handles.length>1, 'Should be 2 or more opened windows');
                    }
                })
                .sleep(config.maxSleepTime)
                // .switchToWindow('nixCalc')

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'nutritionCalculatorsMobile': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != true) {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#navmenu-toggle')
                    .click()
                    .end()

                // Verify if 'Consumer Tools' link button exists
                // TODO: Avoid repeating this verification in each tool
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Consumer Tools');
                    })
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    .end()

                // Verify if 'Search Engine' link button exists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > div > p.section-subtitle')
                    .getVisibleText()
                    .then(function(text) {
                        assert.isTrue(text.indexOf('Nutrition Calculators') > -1, 'Consumer Tools should contains a "Nutrition Calculator" link button');
                    })
                    .end()

                // Go to brand lists
                .findByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > a')
                    .click()
                    .waitForDeletedByCssSelector('body > div.ng-scope > div > div > div.container > div:nth-child(2) > div:nth-child(2) > a')
                    .then()
                    .end()

                // View first listed brand
                .findByCssSelector('.container-calc-brands .row a')
                    .click()
                    // .waitForDeletedByCssSelector('.container-calc-brands .row a')
                    .then()
                    .end()

                  // .getAllWindowHandles()
                  // .then(function(handles) {
                  //     if (handles.length>1) {
                  //         this
                  //         .switchToWindow(handles[handles.length-1])
                  //         .execute(function() {
                  //             window.name = 'nixCalc'; // Naming the window in order to switch to it later swith 'switchToWindow()'
                  //         });
                  //         return handles[1];
                  //     } else {
                  //         assert(handles.length>1, 'Should be 2 or more opened windows');
                  //     }
                  // })
                  // .sleep(config.maxSleepTime)
                  // .switchToWindow('nixCalc')

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        }
    };

    return ConsumerToolsPagex;
});
