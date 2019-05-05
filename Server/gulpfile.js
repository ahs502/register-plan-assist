const gulp = require('gulp');
const typescript = require('gulp-typescript');
const del = require('del');

const typescriptProject = typescript.createProject('tsconfig.json');

function clean() {
  return del('dist/**');
}

gulp.task('tsc', () =>
  typescriptProject
    .src()
    .pipe(typescriptProject())
    .js.pipe(gulp.dest('dist'))
);

gulp.task('public', () => gulp.src(['public/**', 'public/_Readme']).pipe(gulp.dest('dist/public')));
gulp.task('no-public-readme', () => del('dist/public/_Readme'));
gulp.task('files', () => gulp.src(['package.json']).pipe(gulp.dest('dist')));

gulp.task('build', gulp.series(clean, 'tsc', gulp.parallel('public', 'files'), 'no-public-readme'));

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
