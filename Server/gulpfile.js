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
        delete data.compilerOptions.baseUrl;
        delete data.compilerOptions.paths;
        delete data.include;
        fs.writeFile(path.join(__dirname, 'temp/tsconfig.json'), JSON.stringify(data, null, 4), done);
      },
      () => gulp.src(['src/**/*.ts', '../Core/**/*.ts']).pipe(gulp.dest('temp')),
      gulp.series(() => gulp.src('public/**').pipe(gulp.dest('temp/public')), () => del('temp/public/_Readme'))
    ),
    () => {
      const typescriptProject = typescript.createProject('temp/tsconfig.json');
      const conversions = [{ from: '@core/', to: './' }, { from: 'src/', to: './' }];
      return typescriptProject
        .src()
        .pipe(
          modifyFile((content, filePath, file) => {
            const lines = content.split('\r\n');
            let imported = false;
            return lines
              .map(line => {
                const startsWithImport = line.startsWith('import ');
                const hasDependencyName = line.includes("'");
                if (startsWithImport || imported) {
                  imported = !hasDependencyName;
                  hasDependencyName &&
                    conversions.forEach(({ from, to }) => {
                      const firstQuotationIndex = line.indexOf("'");
                      const secondQuotationIndex = line.slice(firstQuotationIndex + 1).indexOf("'") + firstQuotationIndex + 1;
                      const absoluteDependency = line.slice(firstQuotationIndex + 1, secondQuotationIndex); // 'from/utils/module'
                      if (absoluteDependency.startsWith(from)) {
                        const dependencyFile = absoluteDependency.slice(from.length); // 'utils/module'
                        const dependencyPath = path.join(__dirname, 'temp', to, dependencyFile); // '/usr/hessam/projects/plan-assist/Server/temp/to/utils/module'
                        const dependencyRelativePath = path.relative(path.dirname(filePath), dependencyPath).replace(/\\/g, '/'); // '../../to/utils/module'
                        const dependencyRelativePathRelativeForm = dependencyRelativePath.startsWith('.') ? dependencyRelativePath : './' + dependencyRelativePath; // '../../to/utils/module'
                        line = line.slice(0, firstQuotationIndex + 1) + dependencyRelativePathRelativeForm + line.slice(secondQuotationIndex);
                      }
                    });
                }
                return line;
              })
              .join('\r\n');
          })
        )
        .pipe(typescriptProject())
        .js.pipe(gulp.dest(destinationFolder));
    },
    () => gulp.src(['configure.js', packageJsonModifier && 'temp/package.json'].filter(Boolean)).pipe(gulp.dest(destinationFolder)),
    () => del([`${destinationFolder}/config.js`, 'temp/**'])
  );
}

gulp.task('build-dev', buildSource('make'));
gulp.task(
  'build',
  buildSource('dist', data => {
    data.name = 'planassist';
    data.description = 'Intelligent Flight Scheduler';
    data.main = 'index.js';
    data.scripts = {
      start: 'node .',
      config: 'node ./configure.js'
    };
    delete data.devDependencies;
    return data;
  })
);

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
