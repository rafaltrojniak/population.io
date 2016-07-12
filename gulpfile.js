/* jshint node: true */
var gulp = require('gulp');
var git = require('git-rev-sync');
//noinspection JSUnresolvedVariable
var argv = require('yargs').argv;
var bower = require('main-bower-files');
var check = require('gulp-if');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var jade = require('gulp-jade');
var inject = require('gulp-inject');
var stylus = require('gulp-stylus');
var csso = require('gulp-csso');
var nib = require('gulp-stylus/node_modules/nib');

var connect = require('gulp-connect');
var hash = git.short(); // jshint ignore:line

var awspublish = require('gulp-awspublish');
// var scripts = [
// 		'bower_components/d3.slider/d3.slider.js', // ?
// 	]
// ;

gulp.task('data', function(){
	return gulp.src([
			'data/populationio_countries/countries.csv',
			'data/populationio_countries/countries_topo.json'
		])
		.pipe(plumber())
		.pipe(gulp.dest('dist/data'));
});
gulp.task('styles', function(){
	//noinspection JSUnresolvedVariable
	return gulp.src([
		'fonts/plantin/MyFontsWebfontsKit.css',
		'app/stylus/main.styl'
	])
		.pipe(plumber())
		.pipe(stylus({use: nib()}))
		.pipe(check(argv.production, csso()))
		.pipe(concat('main.'+ hash +'.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(connect.reload());
});
gulp.task('lint', function(){
	return gulp.src(['app/scripts/**/*.js', '!app/scripts/libs/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
gulp.task('scripts', ['lint'], function(){
	//noinspection JSUnresolvedVariable
	return gulp.src('app/scripts/**/*.js')
		.pipe(plumber())
		.pipe(check(!argv.production, sourcemaps.init()))
		.pipe(ngAnnotate())
		.pipe(check(argv.production, uglify({drop_console: true})))
		.pipe(concat('main.'+ hash +'.js'))
		.pipe(check(!argv.production, sourcemaps.write('.')))
		.pipe(gulp.dest('dist/scripts'))
		.pipe(connect.reload());
});
gulp.task('vendor', function(){
	gulp.src(bower('**/*.css'))
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('dist/css'));
	gulp.src(bower('**/*.js'))
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('dist/scripts'));
});
gulp.task('translations', function(){
	gulp.src('app/i18n/*')
		.pipe(gulp.dest('dist/i18n'))
		.pipe(connect.reload());
	gulp.src('bower_components/angular-i18n/angular-locale_*.js')
		.pipe(gulp.dest('dist/i18n/angular'));
});
gulp.task('templates', function(){
	return gulp.src(['app/views/**/*.jade', '!app/views/layouts/**/*'])
		.pipe(plumber())
		.pipe(jade())
		.pipe(gulp.dest('dist/views/'))
		.pipe(connect.reload());
});
gulp.task('assets', function(){
	gulp.src('assets/*')
		.pipe(gulp.dest('dist/assets'));
	gulp.src('assets/celebrities/**/*')
		.pipe(gulp.dest('dist/celebrities'));
});
gulp.task('fonts', function(){
	gulp.src(['fonts/**/*'])
		.pipe(gulp.dest('dist/fonts/'));
	gulp.src(bower('**/*.{eot,svg,ttf,woff,woff2}'))
		.pipe(gulp.dest('dist/fonts/'));
});
gulp.task('clean', function(){
	return gulp.src('dist', {read: false})
		.pipe(clean());
});

gulp.task('build', ['vendor', 'styles', 'scripts', 'templates', 'fonts', 'data', 'assets', 'translations'], function(){
	return gulp.src('app/index.jade')
		.pipe(plumber())
		.pipe(jade())
		.pipe(inject(
			gulp.src(['dist/css/vendor.css', 'dist/scripts/vendor.js'], { read: false }),
			{ ignorePath: ['dist/'], starttag: '<!-- inject:deps:{{ext}} -->' }
		))
		.pipe(inject(
			gulp.src(['dist/css/**/*.css', 'dist/scripts/**/*.js', '!dist/css/vendor.css', '!dist/scripts/vendor.js'], { read: false }),
			{ ignorePath: ['dist/'] }
		))
		.pipe(gulp.dest('dist/'))
		.pipe(connect.reload());
});

gulp.task('rebuild', function(done){
	runSequence('clean', 'build', done);
});

gulp.task('deploy', ['rebuild'], function(){
	// TODO: Create proper deployment method
	var publisher = awspublish.create({
		region: 'us-west-2'
	}, {});

	return gulp.src('dist/**/*')
		.pipe(publisher.publish())
		.pipe(awspublish.reporter());
});

gulp.task('watch', ['build'], function(){
	gulp.watch('app/stylus/**/*.styl', ['styles']);
	gulp.watch('app/scripts/**/*.js', ['scripts']);
	return gulp.watch('app/views/**/*.jade', ['templates']);
});

gulp.task('serve', function(){
	connect.server({
		root: 'dist/',
		port: 1983,
		livereload: true,
		host: '0.0.0.0'
	});
});

gulp.task('default', function(done){
	runSequence('watch', 'serve', done);
});
