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
const rename = require('gulp-rename');

const files = {
  scssPath: 'src/scss/**/*.scss',
  jsPath: 'src/js/**/*.js',
  htmlPath: './**/*.html',
  assetsPath: 'src/assets/*'
};

function copyHTMLTask() {
  return src([files.htmlPath]).pipe(dest('dist/'));
}

function copyAssetsTask() {
  return src([files.assetsPath]).pipe(dest('dist/assets'));
}

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return (
    src([files.scssPath])
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // compile SCSS to CSS
      .pipe(postcss([autoprefixer()]))
      .pipe(sourcemaps.write('./'))
      .pipe(dest('dist/css')) // put final CSS in dist folder
      // stream changes to all browsers sync all browser
      // inject changes without refreshing the page
      // This command is useful because it keeps the scroll position intact
      .pipe(browserSync.stream())
  );
}

function jsTask() {
  return (
    src([files.jsPath])
      // To load existing source maps
      // This will cause sourceMaps to use the previous sourcemap to create an ultimate sourcemap
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(concat('all.min.js'))
      // .pipe(rename({ extname: '.min.js' }))
      .pipe(sourcemaps.write('./'))
      .pipe(dest('dist/js'))
  );
}

function jsDistTask() {
  return src([files.jsPath])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(concat('all.js'))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/js'));
}

// start server
// using done
// Gulp needs this hint if you want to order a series of tasks that depend on each other
// series(parallel(scssTask, jsTask), serveTask, watchTask);
// watch task will not start until serveTask stoped
function serveTask(done) {
  // init browserSync
  browserSync.init({
    // setup server
    server: {
      baseDir: './'
    }
  });

  done();
}

// watch for changes
function watchTask() {
  // list files we need to watch
  // watch(files to watch, tasks to run when changes occurs)
  watch(files.scssPath, scssTask);
  watch(files.jsPath, jsTask);
  // when making a change in html, js we need browser to refresh
  watch(files.jsPath).on('change', browserSync.reload);
  watch(files.htmlPath).on('change', browserSync.reload);
}

// you should add your tasks to be run first time
// then any change in them will be managed by watchTask
exports.default = series(parallel(scssTask, jsTask), serveTask, watchTask);

// to produce a production version
exports.build = parallel(scssTask, jsDistTask, copyHTMLTask, copyAssetsTask);
