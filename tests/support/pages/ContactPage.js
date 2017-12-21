'use strict';

define(function(require) {
    function ContactPage(remote) {
        this.remote = remote;
    }

    ContactPage.prototype = {
        constructor: ContactPage,

        /**
         * Contact Form
         */
        'sendMessage': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)
                .sleep(15000)

                .findByCssSelector('#nav-menu li a[href="/contact"]')
                    .click()
                    .end()

                // Fill e-mail field
                .findByCssSelector('input[name="email"]')
                    .type('test@nutritionix.com')
                    .end()

                // Fill phone field
                .findByCssSelector('input[name="phone"]')
                    .type('1-888-NIX-CALC')
                    .end()

                // Fill message field
                .findByCssSelector('textarea[name="message"]')
                    .type('This is a test message generated from an automated functional test, if you are reading this please ignore it.')
                    .end()

                // Check if Submit button exists
                .findByCssSelector('button[type="submit"]')
                .then(function() {
                    return true;
                });
        },
        'sendMessageMobile': function(config) {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .setFindTimeout(config.maxFindTimeout)
                .sleep(15000) // TODO: Check if needed this sleeptime

                .findByCssSelector('#navmenu-toggle')
                    .click()
                    .end()
                .findByCssSelector('#nav-menu li a[href="/contact"]')
                    .click()
                    .end()

                // Fill e-mail field
                .findByCssSelector('input[name="email"]')
                    .type('test@nutritionix.com')
                    .end()

                // Fill phone field
                .findByCssSelector('input[name="phone"]')
                    .type('1-888-NIX-CALC')
                    .end()

                // Fill message field
                .findByCssSelector('textarea[name="message"]')
                    .type('This is a test message generated from an automated functional test, if you are reading this please ignore it.')
                    .end()

                // Check if Submit button exists
                .findByCssSelector('button[type="submit"]')
                .then(function() {
                    return true;
                });
        }

    };

    return ContactPage;
});
