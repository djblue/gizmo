var gulp = require('gulp'),
    _ = require('lodash'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    nodeResolve = require('resolve'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    svg2png = require('gulp-svg2png'),
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
  var stream = b.bundle().pipe(source('vendor.js'));
  if (production) {
    stream = stream.pipe(buffer())
                   .pipe(uglify())
  }
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
  if (production) {
    stream = stream.pipe(buffer())
                   .pipe(uglify())
  }
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

gulp.task('favicon', function () {
  gulp.src('./app/favicon.svg')
    .pipe(svg2png())
    .pipe(gulp.dest('./dist'));
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('less', function () {
  var stream = gulp.src('./app/*.less')
    .pipe(less({
      paths: [ path.join(__dirname) ]
    }))
  if (production) {
    stream = stream.pipe(minifyCSS());
  }
  stream.pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
  return stream;
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
  gulp.watch(['./app/*.less'], ['less'])
  gulp.watch(['./app/*.js'],   ['app'])
});

gulp.task('dist', ['html', 'less', 'vendor', 'app']);
gulp.task('default', ['connect', 'dist', 'watch']);
