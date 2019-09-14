const gulp = require('gulp');
const run = require('gulp-run-command').default;
const del = require('del');

gulp.task('clean', () => del('dist/**'));

gulp.task('install-core', run('npm install', { cwd: './Core' }));
gulp.task('install-server', run('npm install', { cwd: './Server' }));
gulp.task('install-client', run('npm install', { cwd: './Client' }));

gulp.task('build-server', run('npm run build', { cwd: './Server' }));
gulp.task(
  'build-client',
  run('npm run build', {
    cwd: './Client',
    env: {
      PORT: process.env.CLIENT_PORT || 4000
    }
  })
);

gulp.task('dist', gulp.series(() => gulp.src('Server/dist/**').pipe(gulp.dest('dist')), () => gulp.src('Client/build/**').pipe(gulp.dest('dist/public'))));
gulp.task('build', gulp.series('clean', 'build-server', 'build-client', 'dist'));

gulp.task(
  'dev-server',
  run('npm start', {
    cwd: './Server',
    env: {
      PORT: process.env.SERVER_PORT || 3000
    }
  })
);
gulp.task(
  'dev-client',
  run('npm start', {
    cwd: './Client',
    env: {
      PORT: process.env.CLIENT_PORT || 4000,
      PROXY_PORT: process.env.SERVER_PORT || 3000,
      TSC_WATCHFILE: 'UseFsEventsWithFallbackDynamicPolling' //See: https://www.typescriptlang.org/docs/handbook/configuring-watch.html
    }
  })
);

gulp.task('default', done => {
  console.error('Please specify the gulp command.');
  done();
});
