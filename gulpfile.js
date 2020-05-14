// any change in gulpfile need to restart

const { src, dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

const files = {
  scssPath: 'src/scss/**/*.scss',
  jsPath: 'src/js/**/*.js',
  htmlPath: './**/*.html',
  assetsPath: 'src/assets/*'
};

function copyHTMLTask() {
  return src(files.htmlPath).pipe(dest('dist/'));
}

function copyAssetsTask() {
  return src(files.assetsPath).pipe(dest('dist/assets'));
}

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return (
    src(files.scssPath)
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // compile SCSS to CSS
      .pipe(postcss([autoprefixer()]))
      .pipe(dest('dist/css')) // put final CSS in dist folder
      // stream changes to all browsers sync all browser (phone, tab, desktop)
      .pipe(browserSync.stream())
    // .on('end', browserSync.reload)
  );
}

function jsTask() {
  return src(files.jsPath)
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'));
}

function jsDistTask() {
  return src(files.jsPath)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'));
}

// watch for changes
function watchTask() {
  // init browserSync
  browserSync.init({
    // setup server
    server: {
      baseDir: './'
    }
  });
  // list files we need to watch
  // watch(files to watch, tasks to run when changes occurs)
  watch([files.scssPath, files.jsPath, files.htmlPath, files.assetsPath], series(scssTask, jsTask));
  // when making a change in html, js we need browser to refresh
  watch(files.jsPath).on('change', browserSync.reload);
  watch(files.htmlPath).on('change', browserSync.reload);
}

// you should add your tasks to be run first time
// then any change in them will be managed by watchTask
exports.default = series(scssTask, jsTask, watchTask);

// to produce a production version
exports.build = parallel(scssTask, jsDistTask, copyHTMLTask, copyAssetsTask);
