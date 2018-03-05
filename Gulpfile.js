'use strict';
var gulp = require('gulp'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    replace = require('gulp-replace-task'),
    concat = require('gulp-concat-util'),
    through = require('through2'),
    babel = require('gulp-babel');

function transform() {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
        // nothing to do
        return callback(null, file);
    }
    if (file.isStream()) {
        // file.contents is a Stream - https://nodejs.org/api/stream.html
        this.emit('error', new PluginError("BUILD", 'Streams not supported!'));

    } else if (file.isBuffer()) {
      // file content
      var content = file.contents.toString();
      if (content) {
        // change ol_namespace_Class_Att => ol.namespace.Class.Att
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*)_([a-z,A-Z]*))/g,"ol.$2.$3.$4");
        // change ol_namespace_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*)_([a-z,A-Z]*))/g,"ol.$2.$3");
        // change ol_Class => ol.namespace.Class
        content = content.replace(/(\bol_([a-z,A-Z]*))/g,"ol.$2");
        // change var ol.Class => ol.Class
        content = content.replace(/(\bvar ol\.([a-z,A-Z]*))/g,"ol.$2");
        // remove import / export
        content = content.replace(/\bimport (.*)|\bexport (.*)/g,"");
        // remove empty lines
        content = content.replace(/^\s*[\r\n]/gm, '');
        // return content
        file.contents = new Buffer(content);
      }
      return callback(null, file);
    }
  });
};

/**
 * Move the files into root
 * for packaging
 */
gulp.task ("prepublish", function(){
  gulp.src(["./src/*/*.*"], { base: './src' })
    .pipe(gulp.dest('./'));
});

/**
 * Remove files after packaging
 */
gulp.task ("postpublish", function(){
  var clean = require('gulp-clean');
  gulp.src([
      "./control"
    ])
    .pipe(clean());
});

gulp.task('tests', function() {
	return gulp.src('test/**/*.js')
		.pipe(babel({
			plugins: ["transform-es2015-modules-amd"],
      presets: ["es2015"]
		}))
		.pipe(gulp.dest('test/dist'));
});

gulp.task('clean-js', function() {
  return del(['./dist/js/**/*.js']);
});

gulp.task('build-js', ['clean-js'], function() {

  gulp.src(['./src/control/**/*.js'])
    .pipe(transform())
    .pipe(concat('comparisontools.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename({extname: '.min.js'}))
    .pipe(uglify({
            output: {
              preamble: '/**\n* Author: Thomas Tilak\n* github: https://github.com/thhomas/ol-comparison-tools\n* licence: MIT\n*/\n'
            }
    }))
    .on('error', function(error) {
      console.log(error.toString());
    })
    .pipe(gulp.dest('./dist/'));

});

gulp.task('dist', ['build-js']);
