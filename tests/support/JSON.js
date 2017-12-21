'use strict';

define(['require', 'node_modules/intern/browser_modules/dojo/node!fs'], function (require, fs) {
  var testResults = {
    tests: {
        passed: [],
        failed: []
    }
  };

  var resultsFile = 'test-results.json';

  return {
    '/tunnel/start': function (test) {
        fs.exists(resultsFile, function(exists) {
            if(exists) {
                fs.unlink(resultsFile);
            }
        });
    },
    '/tunnel/end': function (test) {
        fs.writeFileSync('test-results.json', JSON.stringify(testResults));
    },
    '/test/start': function(test) {
        console.log(test.id + ' started');
    },
    '/test/pass': function(test) {
        testResults.tests.passed.push(test);
    },
    '/test/fail': function(test) {
        testResults.tests.failed.push(test);
    }
  };
});
