/*jshint node: true, strict: false*/
var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('styles:dev', function() {
    gulp.src('public/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [
                path.join(__dirname, 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets'),
                path.join(__dirname, 'node_modules', 'font-awesome', 'scss'),
                path.join(__dirname, 'public', 'bower_components', 'flag-icon-css', 'sass'),
            ],
            onError: function(err) {
                throw new gutil.PluginError('styles:dev', err);
            }
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'));
});

gulp.task('build-dev', ['styles:dev'], function() {
    gulp.watch(['public/**/*.{scss,sass}'], ['styles:dev']);
});

gulp.task('build', ['styles:dev']);