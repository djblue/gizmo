var gulp = require('gulp'),
    connect = require('gulp-connect'),
    less = require('gulp-less'),
    react = require('gulp-react'),
    browserify = require('gulp-browserify'),
    path = require('path');

gulp.task('js', function () {
  gulp.src('./app/*.js')
    .pipe(react())
    .pipe(browserify({
      debug : !gulp.env.production
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
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
  gulp.watch(['./app/*.js'],   ['js'])
});

gulp.task('dist', ['html', 'less', 'js']);
gulp.task('default', ['connect', 'dist', 'watch']);
