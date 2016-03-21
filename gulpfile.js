var gulp = require('gulp');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var nib = require('gulp-stylus/node_modules/nib');
var sftp = require('gulp-sftp');
var runSequence = require('run-sequence');
var scripts = [
		'bower_components/momentjs/moment.js',
		'bower_components/jquery/dist/jquery.js',
		'bower_components/jquery-ui/jquery-ui.js',
		'bower_components/d3/d3.js',
		'bower_components/d3.slider/d3.slider.js',
		'bower_components/topojson/topojson.js',
		'vendor/d3.geo.projection.v0.min.js',
		'bower_components/lodash/dist/lodash.js',
		'bower_components/bowser/bowser.js',
		'bower_components/ics.js/ics.deps.min.js',
		'bower_components/ics.js/ics.js',

		'bower_components/angular/angular.js',
		'bower_components/angular-route/angular-route.js',
		'bower_components/angular-scroll/angular-scroll.js',
		'bower_components/angular-animate/angular-animate.js',
		'bower_components/angular-easy-social-share/easy-social-share.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
		'bower_components/angular-cookies/angular-cookies.js',
		'bower_components/angular-resource/angular-resource.js',
		'bower_components/angular-ui-router/release/angular-ui-router.js',
		'bower_components/angular-sanitize/angular-sanitize.js',
		'bower_components/angular-translate/angular-translate.js',
		'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
		'app/scripts/**/*.js'
	]
;
// server task
gulp.task('serve', function(){
	connect.server({
		root: 'dist/',
		port: 1983,
		livereload: true,
		host: '0.0.0.0'
	});
});
// data files task
gulp.task('data', function(){
	return gulp.src([
			'data/populationio_countries/countries.csv',
			'data/populationio_countries/countries_topo.json'
		])
		.pipe(plumber())
		.pipe(gulp.dest('dist/data'));
});
// stylus task
gulp.task('stylus', function(){
	return gulp.src(['app/stylus/MyFontsWebfontsKit.css', 'bower_components/fontawesome/css/font-awesome.min.css', 'app/stylus/main.styl'])
		.pipe(plumber())
		.pipe(stylus({use: nib()}))
		.pipe(concat('main.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(connect.reload());
});
// stylus watch task for development
gulp.task('stylus:watch', function(){
	gulp.watch('app/stylus/**/*.styl', ['stylus']);
});
// scripts tasks
gulp.task('scripts', function(){
	gulp.src(scripts)
		.pipe(sourcemaps.init())
		.pipe(uglify({mangle: false, drop_console: true}))
		.pipe(concat('main.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/scripts'))
		.pipe(connect.reload());
});
gulp.task('trans', function(){
	gulp.src('app/i18n/*')
		.pipe(gulp.dest('dist/i18n'))
		.pipe(connect.reload());
});
// scripts watch task for development
gulp.task('scripts:watch', function () {
 return gulp.watch('app/scripts/**/*.js', ['scripts']);
});
// jade tasks
gulp.task('jade', function(){
	return gulp.src('app/**/*.jade')
		.pipe(plumber())
		.pipe(jade())
		.pipe(gulp.dest('dist/'))
		.pipe(connect.reload());
});
// jade watch task for development
gulp.task('jade:watch', function(){
	return gulp.watch('app/views/**/*.jade', ['jade']);
});
gulp.task('images', function(){
	return gulp.src('assets/*')
		.pipe(gulp.dest('dist/assets'))
		.pipe(connect.reload());
});
gulp.task('celebs', function(){
	return gulp.src('assets/celebrities/**/*')
		.pipe(gulp.dest('dist/celebrities'))
		.pipe(connect.reload());
});
gulp.task('fonts', function(){
	gulp.src(['fonts/**/*', 'bower_components/fontawesome/fonts/fontawesome-webfont.*'])
		.pipe(gulp.dest('dist/fonts/'))
		.pipe(connect.reload());
	gulp.src('app/stylus/webfonts/**/*')
		.pipe(gulp.dest('dist/css/webfonts/'))
		.pipe(connect.reload());
});
// jshint task
gulp.task('lint', function(){
	return gulp.src(['app/scripts/**/*.js', '!app/scripts/libs/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
// jshint watch task for development
gulp.task('lint:watch', function(){
	gulp.watch('app/scripts/**/*.js', ['lint']);
});
// clean tasks
gulp.task('clean', function(){
	return gulp.src('dist', {read: false})
		.pipe(clean());
});
// upload to server task
gulp.task('upload', function () {
  return gulp.src('dist/**')
  .pipe(sftp({
    host: '162.209.106.29',
    user: 'populationio_front',
    key: './id_rsa',
    remotePath: '/html/'
  }));
});

gulp.task('build', ['fonts', 'data', 'stylus', 'scripts', 'jade', 'trans', 'images', 'celebs']);
gulp.task('watch', ['stylus:watch', 'scripts:watch', 'jade:watch']);

gulp.task('deploy', function(done){
	runSequence('build', 'upload', done);
});

gulp.task('default', function(done){
	runSequence('build', 'watch', 'serve', done);
});
