const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const typescript = require('gulp-typescript');
const modifyFile = require('gulp-modify-file');
const del = require('del');

function buildSource(destinationFolder, packageJsonModifier) {
  return gulp.series(
    gulp.parallel(() => del('temp/**'), () => del(destinationFolder + '/**')),
    done => {
      const distPath = path.join(__dirname, 'temp');
      fs.exists(distPath, yes => {
        if (yes) return done();
        fs.mkdir(distPath, done);
      });
    },
    gulp.parallel(
      done => {
        if (!packageJsonModifier) return done();
        let data = require('./package.json');
        data = packageJsonModifier(data);
        fs.writeFile(path.join(__dirname, 'temp/package.json'), JSON.stringify(data, null, 4), done);
      },
      done => {
        let data = require('./tsconfig.json');
        data.compilerOptions.paths['@core/*'] = ['./*'];
        delete data.include;
        fs.writeFile(path.join(__dirname, 'temp/tsconfig.json'), JSON.stringify(data, null, 4), done);
      },
      () => gulp.src(['src/**/*.ts', '../Core/**/*.ts']).pipe(gulp.dest('temp')),
      gulp.series(() => gulp.src('public/**').pipe(gulp.dest('temp/public')), () => del('temp/public/_Readme'))
    ),
    () => {
      const typescriptProject = typescript.createProject('temp/tsconfig.json');
      return typescriptProject
        .src()
        .pipe(typescriptProject())
        .js.pipe(
          modifyFile((content, filePath, file) => {
            let i = -1;
            while (((i = content.indexOf('require("@core/', i + 1)), i > 0)) {
              const endingDubleQuotationIndex = content.indexOf('"', i + 15);
              const dependencyFile = content.slice(i + 15, endingDubleQuotationIndex);
              const dependencyPath = path.join(__dirname, 'temp', dependencyFile);
              const dependencyRelativePath = path.relative(path.dirname(filePath), dependencyPath).replace(/\\/g, '/');
              const dependencyRelativePathFromCurrent = dependencyRelativePath.startsWith('.') ? dependencyRelativePath : './' + dependencyRelativePath;
              content = content.slice(0, i + 9) + dependencyRelativePathFromCurrent + content.slice(endingDubleQuotationIndex);
            }
            return content;
          })
        )
        .pipe(gulp.dest(destinationFolder));
    },
    () => gulp.src(['config.js', packageJsonModifier && 'temp/package.json'].filter(Boolean)).pipe(gulp.dest(destinationFolder)),
    () => del('temp/**')
  );
}

gulp.task('build-dev', buildSource('make'));
gulp.task(
  'build',
  buildSource('dist', data => {
    data.name = 'planassist';
    data.description = 'Intelligent Flight Scheduler';
    data.main = 'index.js';
    data.scripts = { start: 'node .' };
    delete data.devDependencies;
    return data;
  })
);

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
