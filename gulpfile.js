'use strict';
const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const source = require('vinyl-source-buffer');
const buffer = require('vinyl-buffer')
const browserify = require('browserify');
const babelify = require('babelify');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rename = require("gulp-rename");
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const browserSync = require('browser-sync').create();

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });
});

gulp.task('js:serve', function () {

    var b = browserify({
        entries: 'assets/js/main.js',
        debug: true,
        transform: [babelify.configure({
            presets: ['es2015']
        })]
    });

    return b.bundle()
        .pipe(source('main.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .on('error', util.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('js_libs', function () {

    return gulp.src('./assets/js/lib/jquery-3.3.1.js')
        .pipe(concat('lib.js', {
            newLine: ';'
        }))
        .pipe(uglify())
        .pipe(rename('lib.min.js'))
        .pipe(gulp.dest('./dist/js/'));

});

gulp.task('js:build', function () {

    return browserify({
            entries: 'assets/js/main.js'
        })
        .transform(babelify, {
            presets: ['es2015']
        })
        .bundle()
        .pipe(source('main.min.js'))
        .pipe(gulp.dest('dist/js'))

});

gulp.task('sass:serve', function () {

    return gulp.src('./assets/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
                includePaths: require('node-normalize-scss').includePaths
            })
            .on('error', sass.logError)
        )
        .pipe(autoprefixer({
            browsers: ['last 8 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('serve', ['browser-sync'], function () {

    gulp.watch('./assets/sass/**/*.scss', ['sass:serve']);
    gulp.watch("./assets/js/**/**/*.js", ['js:serve']);
    gulp.watch("./assets/js/lib/**/*.js", ['js_libs']);
    gulp.watch("./dist/js/*.js").on('change', browserSync.reload);
    gulp.watch("./dist/css/*.css").on('change', browserSync.reload);

});

gulp.task('sass:build', function () {

    return gulp.src('./assets/sass/*.scss')
        .pipe(sass({
                includePaths: require('node-normalize-scss').includePaths
            })
            .on('error', sass.logError)
        )
        .pipe(autoprefixer({
            browsers: ['last 8 versions'],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(gulp.dest('./dist/css/'))

});

gulp.task('build', ['sass:build', 'js:build', 'js_libs']);
gulp.task('default', ['serve']);