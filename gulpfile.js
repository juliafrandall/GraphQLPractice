'use strict';

const fs   = require('fs-extra');
const path = require('path');
const sha1 = require('node-sha1');

const gulp        = require('gulp');
const plugins     = require('gulp-load-plugins')();
const streamqueue = require('streamqueue');

const distDir = './client/nix_dist';


const rev = require('child_process')
  .execSync('cd {root} && git rev-parse HEAD'.replace('{root}', __dirname))
  .toString()
  .trim()
  .substr(0, 6);

gulp.task('clean', function () {
  fs.removeSync(distDir + '/*');
});

gulp.task('vendors.css', function () {
  const stream = streamqueue({objectMode: true});
  stream.queue(
    gulp.src('./client/nix_assets/scss/vendors.scss')
      .pipe(plugins.sass({
        errLogToConsole: true
      }))
  );

  stream.queue(gulp.src([
    './client/nix_bower_components/angular-chart.js/dist/angular-chart.css',
    './client/nix_bower_components/angular-rangeslider/angular.rangeSlider.css',
    './client/nix_bower_components/angular-loading-bar/build/loading-bar.css',
    './client/nix_bower_components/cal-heatmap/cal-heatmap.css',
    './client/nix_bower_components/bootstrap-toggle/css/bootstrap-toggle.css',
    './client/nix_bower_components/angular-diet-graph-directive/dist/angular-diet-graph-directive.css',
    './client/nix_bower_components/angular-ui-select/dist/select.css',
    './client/nix_bower_components/selectize/dist/css/selectize.bootstrap3.css',
    './client/nix_bower_components/jqcloud2/dist/jqcloud.css',
    './client/nix_bower_components/ng-tags-input/ng-tags-input.css'
  ]));

  stream.queue(
    gulp.src('./client/nix_bower_components/nutrition-label-jquery-plugin/dist/css/nutritionLabel.css')
      .pipe(plugins.replace('url("images/', 'url("/nix_bower_components/nutrition-label-jquery-plugin/dist/images/'))
  );

  stream.queue(
    gulp.src('./client/nix_bower_components/leaflet/dist/leaflet.css')
      .pipe(plugins.replace('url(images/', 'url(/nix_bower_components/leaflet/dist/images/'))
  );

  return stream.done()
    .pipe(plugins.cleanCss({compatibility: 'ie9'}))
    .pipe(plugins.replace('http://', '//'))
    .pipe(plugins.concat('vendors.css'))
    .pipe(gulp.dest(distDir));
});

gulp.task('main.css', function () {
  return gulp.src(['./client/nix_assets/scss/main.scss', './client/nix_assets/css/app-add.css'])
    .pipe(plugins.sass({
      errLogToConsole: true
    }))
    .pipe(plugins.cleanCss({compatibility: 'ie9'}))
    .pipe(plugins.concat('main.css'))
    .pipe(gulp.dest(distDir));
});

gulp.task('reports.css', function () {
  return gulp.src(['./client/nix_assets/scss/reports.scss'])
    .pipe(plugins.sass({
      errLogToConsole: true
    }))
    .pipe(plugins.cleanCss({compatibility: 'ie9'}))
    .pipe(plugins.concat('reports.css'))
    .pipe(gulp.dest(distDir));
});

gulp.task('print.css', function () {
  return gulp.src(['./client/nix_assets/scss/print.scss'])
    .pipe(plugins.sass({
      errLogToConsole: true
    }))
    .pipe(plugins.cleanCss({compatibility: 'ie9'}))
    .pipe(plugins.concat('print.css'))
    .pipe(gulp.dest(distDir));
});

gulp.task('vendors.js', function () {
  const stream = streamqueue({objectMode: true});

  stream.queue(
    gulp.src([
        './client/nix_global_snippets/vendors.top.js',
        './client/nix_bower_components/moment/min/moment-with-locales.js'
      ])
      .pipe(plugins.uglify())
  );

  stream.queue(gulp.src([
    './client/nix_bower_components/lodash/lodash.min.js',
    './client/nix_bower_components/jquery/dist/jquery.min.js',
    './client/nix_bower_components/moment-timezone/builds/moment-timezone-with-data.min.js',
    './client/nix_bower_components/Chart.js/dist/Chart.bundle.min.js',
    './client/nix_bower_components/d3/d3.min.js',
    './client/nix_bower_components/cal-heatmap/cal-heatmap.min.js',
    './client/nix_bower_components/bootstrap-toggle/js/bootstrap-toggle.min.js',
    './client/nix_bower_components/ua-parser-js/dist/ua-parser.min.js',
    './client/nix_bower_components/jqcloud2/dist/jqcloud.min.js',
    './client/nix_bower_components/nutritionix-api-data-utilities/dist/index.js',
    './client/nix_bower_components/papaparse/papaparse.min.js',
    './client/nix_bower_components/leaflet/dist/leaflet.js',
    './client/nix_bower_components/jQuery-Watermark/jquery.watermark.min.js',
    './client/nix_bower_components/nutrition-label-jquery-plugin/dist/js/nutritionLabel-min.js',
    './client/nix_assets/js/uuid_v3.0.0.js'
  ]));

  stream.queue(
    gulp.src([
        './client/nix_bower_components/qrcode/lib/qrcode.js',
        './client/nix_bower_components/marked/lib/marked.js'
      ])
      .pipe(plugins.uglify())
  );

  stream.queue(gulp.src([
    './client/nix_bower_components/angular/angular.min.js',
    './client/nix_bower_components/angular-animate/angular-animate.min.js',
    './client/nix_bower_components/angular-messages/angular-messages.min.js',
    './client/nix_bower_components/angular-sanitize/angular-sanitize.min.js',
    './client/nix_bower_components/angular-touch/angular-touch.min.js',
    './client/nix_bower_components/angular-cookies/angular-cookies.min.js',
    './client/nix_bower_components/angular-shims-placeholder/dist/angular-shims-placeholder.min.js',
    './client/nix_bower_components/angular-ui-router/release/angular-ui-router.min.js',
    './client/nix_bower_components/ui-router-metatags/dist/ui-router-metatags.min.js',
    './client/nix_bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    './client/nix_bower_components/angular-nutritionix-api/angular-nutritionix-api.min.js',
    './client/nix_bower_components/angular-chart.js/dist/angular-chart.min.js',
    './client/nix_bower_components/angular-encode-uri/dist/angular-encode-uri.min.js',
    './client/nix_bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
    './client/nix_bower_components/angular-pusher/angular-pusher.min.js',
    './client/nix_bower_components/angular-moment/angular-moment.min.js',
    './client/nix_bower_components/angular-loading-bar/build/loading-bar.min.js',
    './client/nix_bower_components/ngstorage/ngStorage.min.js',
    './client/nix_bower_components/ng-focus-if/focusIf.min.js',
    './client/nix_bower_components/track-api-angular-client/track-api-angular-client.min.js',
    './client/nix_bower_components/angular-password/angular-password.min.js',
    './client/nix_bower_components/angular-carousel/dist/angular-carousel.min.js',
    './client/nix_bower_components/angular-fda-round-filter/angular-fda-round-filter.min.js',
    './client/nix_bower_components/angular-diet-graph-directive/dist/angular-diet-graph-directive.min.js',
    './client/nix_bower_components/ng-textcomplete/ng-textcomplete.min.js',
    './client/nix_bower_components/nix-angular-textcomplete-directive/dist/nix-angular-textcomplete-directive.min.js',
    './client/nix_bower_components/angular-qr/angular-qr.min.js',
    './client/nix_bower_components/angular-ui-select/dist/select.min.js',
    './client/nix_bower_components/slick-carousel/slick/slick.min.js',
    './client/nix_bower_components/angular-slick-carousel/dist/angular-slick.min.js',
    './client/nix_bower_components/angular-recaptcha/release/angular-recaptcha.min.js',
    './client/nix_bower_components/ng-csv/build/ng-csv.min.js',
    './client/nix_bower_components/slideout.js/dist/slideout.min.js',
    './client/nix_bower_components/ng-file-upload/ng-file-upload-all.min.js',
    './client/nix_bower_components/ngGeolocation/ngGeolocation.min.js',
    './client/nix_bower_components/angular-simple-logger/dist/angular-simple-logger.light.min.js',
    './client/nix_bower_components/ui-leaflet/dist/ui-leaflet.min.js',
    './client/nix_bower_components/angular-nutrition-label/angular-nutrition-label.min.js',
    './client/nix_bower_components/angular-marked/dist/angular-marked.min.js',
    './client/nix_bower_components/ng-tags-input/ng-tags-input.min.js'
  ]));

  stream.queue(
    gulp.src('./client/nix_bower_components/angular-drag-drop/dist/angular-drag-drop.js')
      .pipe(plugins.replace("require('angular')", "angular"))
      .pipe(plugins.uglify())
  );

  stream.queue(
    gulp.src([
        './client/nix_bower_components/ng-debounce/angular-debounce.js',
        './client/nix_bower_components/angular-rangeslider/angular.rangeSlider.js',
        './client/nix_bower_components/ngtweet/dist/ngtweet.js',
        './client/nix_bower_components/angular-truncate/src/truncate.js',
        './client/nix_bower_components/angular-facebook/lib/angular-facebook.js',
        './client/nix_bower_components/angular-qrcode/angular-qrcode.js',
        './client/nix_bower_components/angular-jqcloud/angular-jqcloud.js'
      ])
      .pipe(plugins.ngAnnotate())
      .pipe(plugins.uglify())
  );

  return stream.done()
    .pipe(plugins.concat('vendors.js'))
    .pipe(plugins.replace(/\/\/# sourceMappingURL=.*?map/g, ''))
    .pipe(plugins.replace('.catch', "['catch']"))
    .pipe(plugins.replace('.finally', "['finally']"))
    .pipe(gulp.dest(distDir));
});

gulp.task('templates.js', function () {
  return gulp.src(['./client/nix_app/**/*.html', '!./client/nix_app/index.html'])
    .pipe(plugins.angularTemplatecache({
      module: 'nutritionix',
      root:   '/nix_app/'
    }))
    .pipe(gulp.dest(distDir));
});

gulp.task('main.js', ['templates.js'], function () {
  let stream = streamqueue({objectMode: true});
  stream.queue(gulp.src([
      './client/nix_app/app.js',
      './client/nix_app/**/*module.js',
      './client/nix_app/**/*.js'
    ])
    .pipe(plugins.babel({presets: ['es2015']}))
  );

  stream.queue(gulp.src('./client/nix_dist/templates.js'));

  stream = stream.done()
    .pipe(plugins.concat('main.js'))
    .pipe(plugins.replace('.catch', "['catch']"))
    .pipe(plugins.replace('.finally', "['finally']"));

  if ((process.env.NODE_ENV || 'development') !== 'development') {
    stream = stream.pipe(plugins.stripDebug());
  }

  return stream.pipe(plugins.ngAnnotate())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(distDir));
});

gulp.task("layout", ['vendors.js', 'vendors.css', 'main.js', 'main.css', 'reports.css', 'print.css'], function () {
  const layoutFile = "./client/nix_app/index.html";

  const files = [
    'vendors.css',
    'vendors.js',
    'main.css',
    'main.js',
    'reports.css',
    'print.css'
  ];

  let layout = fs.readFileSync(layoutFile, "utf8");

  files.forEach(function (fileName) {
    const ext      = path.extname(fileName);
    const basename = path.basename(fileName, ext);

    const hashedFileName = basename + '_' + rev + ext;

    fs.renameSync(path.join(distDir, fileName), path.join(distDir, hashedFileName));

    layout = layout.replace(fileName, hashedFileName);

    if (ext === '.js' && fs.existsSync(path.join(distDir, fileName + '.map'))) {
      fs.renameSync(path.join(distDir, fileName + '.map'), path.join(distDir, hashedFileName + '.map'));

      fs.outputFileSync(
        path.join(distDir, hashedFileName),
        fs.readFileSync(path.join(distDir, hashedFileName), 'utf8').replace(fileName + '.map', hashedFileName + '.map')
      );
    }
  });

  fs.outputFileSync(path.join(distDir, 'layout.html'), layout);
});


gulp.task('watch', ['clean', 'default', 'layout'], function () {
  gulp.watch('./client/**/*.scss', ['default']);
  gulp.watch('./client/nix_app/**/*.js', ['default']);
  gulp.watch('./client/nix_app/**/*.html', ['default']);
});


gulp.task('default', ['clean'], function () {
  return gulp.start('layout');
});

gulp.task('develop', ['watch'], function () {
  return plugins.nodemon({
      script: 'server/app.js',
      watch:  'server/**/*',
      ext:    'js json pug',
      env:    {'NODE_ENV': 'development'}
    })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});
