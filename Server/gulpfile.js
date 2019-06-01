const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
// const typescript = require('gulp-typescript');
const del = require('del');

// const typescriptProject = typescript.createProject('tsconfig.json');

function clean() {
  return del('dist/**');
}

// gulp.task('tsc', () =>
//   typescriptProject
//     .src()
//     .pipe(typescriptProject())
//     .js.pipe(gulp.dest('dist'))
// );

gulp.task('ensure-dist-folder', done => {
  const distPath = path.join(__dirname, 'dist');
  fs.exists(distPath, yes => {
    if (yes) return done();
    fs.mkdir(distPath, done);
  });
});

gulp.task('package.json', done => {
  let data = require('./package.json');
  data.name = 'planassist';
  data.description = 'Intelligent Flight Scheduler';
  data.main = 'index.ts';
  data.scripts = { start: 'ts-node --project tsconfig.json index.ts' };
  delete data.devDependencies;
  fs.writeFile(path.join(__dirname, 'dist/package.json'), JSON.stringify(data, null, 4), done);
});
gulp.task('tsconfig.json', done => {
  let data = require('./tsconfig.json');
  data.compilerOptions.paths['@business/*'] = ['./business/*'];
  delete data.include;
  fs.writeFile(path.join(__dirname, 'dist/tsconfig.json'), JSON.stringify(data, null, 4), done);
});
gulp.task('configs', gulp.parallel('package.json', 'tsconfig.json'));

gulp.task('sources', gulp.parallel(() => gulp.src('src/**/*.ts').pipe(gulp.dest('dist')), () => gulp.src('../Client/src/business/**/*.ts').pipe(gulp.dest('dist/business'))));
gulp.task('public', gulp.series(() => gulp.src(['public/**', 'public/_Readme']).pipe(gulp.dest('dist/public')), () => del('dist/public/_Readme')));

// gulp.task('build', gulp.series(clean, 'tsc', gulp.parallel('public', 'configs'), 'no-public-readme'));

gulp.task('build', gulp.series(clean, 'ensure-dist-folder', gulp.parallel('configs', 'public', 'sources')));

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
