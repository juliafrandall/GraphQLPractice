'use strict';

define(function(require) {
    function IndexPage(remote) {
        this.remote = remote;
    }

    IndexPage.prototype = {
        constructor: IndexPage,
        /**
         * Navigation
         */
        'topMenu': function(config) {
            // TODO: Arra with menu items text Ex: ['home', 'contact', ...]
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#nav-menu li a[href="/database"]')
                    .end()
                .findByCssSelector('#nav-menu li a[href="/consumer"]')
                    .end()
                .findByCssSelector('#nav-menu li a[href="/business"]')
                    .end()
                .findByCssSelector('#nav-menu li a[href="/contact"]')
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'bottomMenu': function(config) {
            // TODO: Arra with menu items text Ex: ['home', 'contact', ...]
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('.site-footer a[href="/about"]')
                    .end()
                .findByCssSelector('.site-footer a[href="/business/api"]')
                    .end()
                .findByCssSelector('.site-footer a[href="http://blog.nutritionix.com"]')
                    .end()
                .findByCssSelector('.site-footer a[href="https://www.jobscore.com/jobs2/nutritionix"]')
                    .end()
                .findByCssSelector('.site-footer a[href="/contact"]')
                    .end()
                .findByCssSelector('.site-footer a[href="/privacy"]')
                    .end()
                .findByCssSelector('.site-footer a[href="/terms"]')
                    .end()
                .findByCssSelector('.site-footer a[href="https://client.nutritionix.com/"]')
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },


        /**
         * Search
         */
        'searchFood': function(config, term) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .setWindowSize(config.width, config.height)
                .takeScreenshot()
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#foodSearch')
                    .type(term)
                    .end()
                .findByCssSelector('.input-group-addon') // TODO: Select a more unique CSS selector
                    .click()
                    .waitForDeletedByCssSelector('.carousel')
                    //.end()
                .then(function() {
                    this.end();
                }).end()
                .findByCssSelector('.list-search-results > li')

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },

        'searchFoodMobile': function(config, term) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .takeScreenshot()
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('#food-toggle')
                    .click()
                    .then()
                    .end()
                .findByCssSelector('#foodSearch')
                    .type(term)
                    .end()
                .findByCssSelector('.input-group-addon') // TODO: Select a more unique CSS selector
                    .click()
                    .then()
                    .end()
                .waitForDeletedByCssSelector('.carousel')
                    .then()
                    .end()
                .findByCssSelector('.list-search-results > li')
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
    };

    return IndexPage;
});
