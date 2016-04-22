var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

/*gulp.task('sass', function () {
    return gulp.src('public/sass/*.scss')
               .pipe(sass({ outputStyle: 'expanded'}).on('error', sass.logError))
               .pipe(gulp.dest('public/stylesheets'));
});*/

//自动添加浏览器支持前缀并压缩CSS
gulp.task('fnCss', function () {
    gulp.src('public/stylesheets/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: true
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/css'));
});

//压缩js文件
gulp.task('uglify', function () {
    gulp.src('public/javascripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function () {
    gulp.watch('public/stylesheets/*.css', ['fnCss']);
});
