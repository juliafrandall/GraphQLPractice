#!/usr/bin/env node
'use strict';

require('colors');

var S   = require('string');
var AWS = require('aws-sdk');
var optimist = require('optimist')
          .usage('list AWS server resources'.green)

          .options('sk',{
            alias: 'selectedKey',
            describe: 'selected aws attribute to be returned (PublicDnsName, PrivateIpAddress)'.yellow,
            default: 'PrivateIpAddress',
            demand: true
          })
          .options('o',{
            alias: 'out',
            describe: 'change output format to text'.yellow,
            boolean: true,
            default: false
          })

          .options('op',{
            alias:'option',
            describe: 'select option by index of json array'.yellow
          })

          .options('co',{
              alias:'count',
              describe: 'count number of servers'.yellow,
              boolean: true,
              default: false
          })
          .options('c',{
              alias:'camelize',
              describe: 'camelize json keys'.yellow,
              boolean: true,
              default: false
          })
          .options('s',{
              alias:'select',
              describe: 'select an array of servers by key'.yellow
          })

          .options('l',{
            alias: 'listTagKeys',
            describe: 'list all instance tag keys',
            boolean: true,
            default: false
          })

          .options('h', {
            alias: 'help',
            describe: 'display this help message'.yellow,
            boolean: true,
            default: false
          });


var argv = optimist.argv;

if (argv.help) {
    optimist.showHelp();
    process.exit();
}

var _    = require('underscore');
var select = argv.select || process.env.AWS_INV_SELECT;
var ec2 = new AWS.EC2({
    region: 'us-east-1'
});

var exit = process.exit;
var normalizeKey = function (s, camelize) {
    camelize = camelize || argv.camelize || false;

    s = S(s)
        .replaceAll('-',' ')
        .replaceAll('_',' ')
        .replaceAll(':',' ')
        .replaceAll('.',' ')
        .stripPunctuation()
        .s.toLowerCase().trim();

    s = camelize ? S(s).camelize() : S(s).underscore();

    return s.s;
};

var stringify = function(o){
    return JSON.stringify(o,null,4);
};

ec2.describeInstances(function(err, results) {

    if (err) {
      throw err;
    }

    var finalList = {};
    var Reservations = results.Reservations ? results.Reservations : null;



    if (!Reservations) {
        return exit();
    }

    Reservations.forEach(function(Res) {

        Res.Instances.forEach(function(Instance) {

            var SelectedAttr = Instance[argv.selectedKey];

            var Tags = Instance.Tags;

            Tags.forEach(function(Tag) {

                var Key = normalizeKey([Tag.Key, Tag.Value].join(' '));

                var exists = finalList[Key] !== void 0;

                finalList[Key] = exists ? finalList[Key] : [];

                if (SelectedAttr !== '' && SelectedAttr !== void 0) {
                    finalList[Key].push(SelectedAttr);
                }

            });

        });

    });

    if (select) {
        finalList = _.pick(finalList,select);
    }

    if (!finalList) {
        console.error('%s is not a valid tag key', select);
        return exit(1);
    }

    if (argv.listTagKeys) {
        console.log(stringify(Object.keys(finalList)));
        return exit();
    }

    if (argv.count) {
        var count = Object.keys(finalList).length;
        console.log(count);
        return exit();
    }

    var text = argv.out && argv.select;
    console.log(text ? finalList[select][argv.option] : stringify(finalList));

});
