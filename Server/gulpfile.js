const fs = require('fs');
const path = require('path');
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

// gulp.task('files', () => gulp.src(['package.json']).pipe(gulp.dest('dist')));
gulp.task('files', done => {
  let packageJson = require('./package.json');

  packageJson.name = 'planassist';
  packageJson.description = 'Intelligent Flight Scheduler';
  packageJson.main = 'index.js';
  packageJson.scripts = { start: 'node .' };
  delete packageJson.devDependencies;

  const distPath = path.join(__dirname, 'dist');
  fs.exists(distPath, yes => {
    if (yes) return writeFile();
    fs.mkdir(distPath, err => {
      if (err) return done(err);
      writeFile();
    });
  });

  function writeFile() {
    fs.writeFile(path.join(distPath, 'package.json'), JSON.stringify(packageJson, null, 4), done);
  }
});

gulp.task('build', gulp.series(clean, 'tsc', gulp.parallel('public', 'files'), 'no-public-readme'));

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
