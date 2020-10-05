'use strict';
const gulp = require('gulp'),
    del = require('del'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    through = require('through2'),
    // uglifyes = require('uglify-es'),
    // composer = require('gulp-uglify/composer'),
    minify = require('gulp-minify'),
    webpack = require('webpack-stream'),
    cleanCSS = require('gulp-clean-css'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass');

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
        // change var ol.Class => ol.Class and const ol.Class => ol.Class
        content = content.replace(/(\bvar ol\.([a-z,A-Z]*))/g,"ol.$2");
        content = content.replace(/(\bconst ol\.([a-z,A-Z]*))/g,"ol.$2");
        // remove import / export
        content = content.replace(/\bimport (.*)|\bexport (.*)/g,"");
        // remove empty lines
        content = content.replace(/^\s*[\r\n]/gm, '');
        // return content
        file.contents = Buffer.from(content);
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
  return gulp.src(["./src/*/*.*", "./src/*.js"], { base: './src' })
    .pipe(gulp.dest('./'));
});

/**
 * Remove files after packaging
 */
gulp.task ("postpublish", function(){
  var clean = require('gulp-clean');
  return gulp.src(["./control", "./control.js", "./util.js"])
    .pipe(clean());
});


gulp.task('clean-js', function() {
  return del(['./dist/js/**/*.js']);
});

gulp.task('build-js', function() {
  // var minify = composer(uglifyes, console)
  return gulp.src(['./src/control/**/*.js'])
    .pipe(transform())
    .pipe(concat('comparisontools.js'))
    // .pipe(rename({extname: '.min.js'}))
    // .pipe(minify({
    //         output: {
    //           preamble: '/**\n* Author: Thomas Tilak\n* github: https://github.com/thhomas/ol-comparison-tools\n* licence: MIT\n*/\n'
    //         }
    // }))
    .pipe(minify({
      ext: {
        src: ".js",
        min: ".min.js"
      }
    }))
    .on('error', function(error) {
      console.log(error.toString());
    })
    .pipe(gulp.dest('./dist/'));

});

// Build css. Use --debug to build in debug mode
gulp.task('build-css', function () {
  return gulp.src([
    "./src/control/*.css"
  ])
  .pipe(concat('comparisontools.css'))
  .pipe(gulp.dest('./dist'));

});

gulp.task('build-css-min', function() {
  return  gulp.src([
    "./src/control/*.css"
  ])
  .pipe(concat('comparisontools.min.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./dist'));
});

gulp.task('build-examples-js', function() {
  return gulp.src('examples/package/example.js')
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('examples/package/dist'));

});

gulp.task('build-examples-css', function() {
  return gulp.src('examples/package/example.scss')
    .pipe(sass())
    .pipe(gulp.dest('examples/package/dist'));
});

gulp.task('http-server', function() {
  connect.server({
    root: '.',
    livereload: true
  });
});

gulp.task('build-examples', gulp.series('build-examples-js', 'build-examples-css'));

gulp.task('dist', gulp.series('clean-js', 'build-js', 'build-css', 'build-css-min'));
