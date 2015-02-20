var gulp = require('gulp'),
    _ = require('lodash'),
    nodeResolve = require('resolve'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    path = require('path');

var production = (process.env.NODE_ENV === 'production');

function getNPMPackageIds () {
  // read package.json and get dependencies' package ids
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
    // does not have a package.json manifest
  }
  return _.keys(packageManifest.dependencies)
          .concat(['events', 'util']) || [];
}

gulp.task('vendor', function () {
  var b = browserify();
  getNPMPackageIds().forEach(function (id) {
    b.require(nodeResolve.sync(id), { expose: id });
  });
  var stream = b.bundle()
                .pipe(source('vendor.js'));
  stream.pipe(gulp.dest('./dist/'));
  return stream;
});


gulp.task('app', function () {

  var b = browserify('./app/app.js', {
    debug: !production
  });

  b.transform(reactify);

  getNPMPackageIds().forEach(function (id) {
    b.external(id);
  });

  var stream = b.bundle()
                .pipe(source('app.js'));

  stream.pipe(gulp.dest('./dist'))
        .pipe(connect.reload());

  return stream;
});

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('less', function () {
  gulp.src('./app/*.less')
    .pipe(less({
      paths: [ path.join(__dirname) ]
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
  gulp.watch(['./app/*.less'], ['less'])
  gulp.watch(['./app/*.js'],   ['app'])
});

gulp.task('dist', ['html', 'vendor', 'app']);
gulp.task('default', ['connect', 'dist', 'watch']);
