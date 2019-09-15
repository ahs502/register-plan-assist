const fs = require('fs');

const config = {
  env: process.env['ENV'],
  version: require('./package.json').version,
  oauth: {
    serverUrl: process.env['OAUTH_SERVER_URL'],
    serverIssuer: process.env['OAUTH_SERVER_ISSUER'],
    clientUrl: process.env['OAUTH_CLIENT_URL'],
    clientId: process.env['OAUTH_CLIENT_ID'],
    resourceName: process.env['OAUTH_RESOURCE_NAME'],
    lang: process.env['OAUTH_LANG']
  },
  sqlServer: {
    server: process.env['SQL_SERVER_SERVER'],
    database: process.env['SQL_SERVER_DATABASE'],
    username: process.env['SQL_SERVER_USERNAME'],
    password: process.env['SQL_SERVER_PASSWORD']
  },
  secretKey: generateRandomString('100')
};

const configFile = './config.js';
const configFileContent = `module.exports = ${JSON.stringify({ default: config }, null, 2)};`;

fs.existsSync(configFile) && fs.unlinkSync(configFile);
fs.writeFileSync(configFile, configFileContent, { encoding: 'utf8' });

const package = require('./package.json');
delete package.scripts.config;
fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));

fs.unlinkSync('./configure.js');

console.log(' => File ./config.js is created successfully!');
console.log(' => The configuration is:');
console.log('===================================================================');
console.log(JSON.stringify(config, null, 4));
console.log('===================================================================');

function generateRandomString(length) {
  const chars = ' abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890 `!@#$%^&*()_+-=[]{}\'\\",<.>/? '.split('');
  let n = Date.now() % chars.length;
  let randomString = '';
  while (length-- > 0) {
    randomString += chars[n];
    n = (n + Math.round(chars.length * 10 * Math.random())) % chars.length;
  }
  return randomString;
}
