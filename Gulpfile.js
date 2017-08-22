'use strict';
var gulp = require('gulp'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    args = require('yargs').argv,
    fs = require('fs'),
    replace = require('gulp-replace-task'),
    concat = require('gulp-concat-util');


gulp.task('clean-js', function() {
  return del(['./build/js/**/*.js']);
});

gulp.task('build-js', ['clean-js'], function() {

  gulp.src(['./src/**/*.js'])
    .pipe(concat('comparisonTools.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(rename({extname: '.min.js'}))
    .pipe(uglify({
            output: {
              preamble: '/**\n* Author: Thomas Tilak\n* github: https://github.com/thhomas/ol-comparison-tools\n* licence: MIT\n*/\n'
            }
    }))
    .on('error', function(error) {
      console.log(error.toString());
    })
    .pipe(gulp.dest('./build/'));

});

gulp.task('build', ['build-js']);
