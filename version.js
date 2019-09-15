const { exec } = require('child_process');
const package = require('./package.json');

switch (process.argv[2]) {
  case 'pre':
    exec('git rev-parse --abbrev-ref HEAD', (error, stdout, stderr) => {
      if (error) throw stderr;
      if (stdout.replace(/\n/g, '') !== 'master') throw "Version only on branch 'master'.";
      exec('git diff-index HEAD', (error, stdout, stderr) => {
        if (error) throw stderr;
        if (stdout) throw 'There are un-committed file(s).';
      });
    });
    break;

  case 'post':
    exec(
      `npm version --prefix Core ${package.version} &&` +
        `npm version --prefix Server ${package.version} &&` +
        `npm version --prefix Client ${package.version} &&` +
        `git commit -am"${package.version}" &&` +
        `git tag v${package.version}`,
      (error, stdout, stderr) => {
        if (error) throw stderr;
        console.log(stdout);
      }
    );
    break;

  default:
    throw 'Invalid version command.';
}
