var gulp = require('gulp')
var gulpPlumber = require('gulp-plumber');// 錯誤處理
var merge= require('merge-stream');// merge-stream
var _del = require('del');

//gulp-webserver
var webserver = require('gulp-webserver');
gulp.task('webserver', function() {
  gulp.src('./public')
    .pipe(webserver({
      port:1919,
      livereload: true,
      directoryListing: false,
      open: "index.html"
    }));
});


//gulp-file-include
var fileinclude = require('gulp-file-include')
gulp.task('fileinclude', function() {
  gulp.src(['develop/*.html'])
	.pipe(gulpPlumber())
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	}))
	.pipe(gulp.dest('./public'));
});

// gulp-concatnpm 
var concat= require('gulp-concat');

gulp.task('concat', function() { //合併檔案
	var concat1=gulp.src(['develop/js/*.js'])
		.pipe(gulpPlumber())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./public/src/build/js'));
//	var concat2= gulp.src(['develop/js/firebase_init.js'])
//		.pipe(gulpPlumber())
//		.pipe(gulp.dest('./public/src/build/js'));
//	return merge(concat1, concat2);
//    return merge(concat1);
});

//gulp-less
var less = require('gulp-less');
//gulp-sass
var sass = require('gulp-sass');
gulp.task('concat_css', function () {
    var lessStream = gulp.src('develop/css/*.less')
        .pipe(less())
    var scssStream = gulp.src('develop/css/*.scss')
        .pipe(sass())
    var cssStream = gulp.src('develop/css/*.css')
    var mergedStream = merge(scssStream,lessStream,cssStream)
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./public/src/build/css'));
    return mergedStream;
});

var imagemin = require('gulp-imagemin');
gulp.task('imagemin',function(){
    gulp.src(['public/src/static/images/*','public/src/static/images/*/*'])
		.pipe(imagemin())
		.pipe(gulp.dest('./public/src/sconcattatic/images'));
});


var staticHash = require('gulp-static-hash');//gulp-static-hash (亂數 hash)
var htmlmin = require('gulp-htmlmin'); // gulp-htmlmin (最小化檔案)
var cssmin = require('gulp-minify-css'); //(最小化檔案)
var gulpUglify = require('gulp-uglify'); // gulp-uglify (最小化檔案)
gulp.task('html', function () {
    gulp.src('public/*.html')
		.pipe(staticHash({asset: 'static'}))
	  .pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./public'));
});
gulp.task('cssmin', function () {
    gulp.src('public/src/build/css/*.css')
		.pipe(cssmin())
		.pipe(gulp.dest('./public/src/build/css'));
});
gulp.task('gulpUglify', function () {
    gulp.src('public/src/build/js/*.js')
		.pipe(gulpUglify())
		.pipe(gulp.dest('./public/src/build/js'));
});

gulp.task('copy', function() { //複製靜態檔案
	var copy1=gulp.src(['develop/static/*/*','develop/static/*/*/*'])
	  .pipe(gulp.dest('./public/src/static/'));
	var copy2=gulp.src(['./favicon.ico'])
		.pipe(gulp.dest('./public/'));
});


//即時監控
//develop watch下的檔案 新增資料夾重新命名會出錯 
gulp.task('watch', function () {
	gulp.watch(['develop/*.html'], ['fileinclude']);
	gulp.watch(['develop/include/*.html'], ['fileinclude']);
	gulp.watch(['develop/css/*.less'], ['concat_css']);
	gulp.watch(['develop/js/*.js'], ['concat']);
	gulp.watch(['develop/static'], ['copy']);
})


//初始化建專案 (第一次執行專案時)
gulp.task('build', ['fileinclude','concat_css','concat','copy']);

//清除public資料夾檔案
gulp.task('clear', function(){ 
  return _del('./public', {force:true});
});

//預設執行(直接打gulp即可)
gulp.task('default', ['watch','fileinclude','concat_css','webserver','concat','copy']);

//deploy 前執行的最小化檔案
gulp.task('deploy', ['imagemin','html','cssmin','gulpUglify']);