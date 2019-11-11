var config = {
  env: 'development',
  version: require('../../package.json').version, // Only for development time, from the package.json file in the root folder.
  oauth: {
    serverUrl: 'https://login.mahan.aero/adfs/oauth2/token',
    serverIssuer: 'https://login.mahan.aero/adfs/oauth2/authorize',
    clientUrl: 'http://localhost:4000/',
    clientId: 'b3ca0b10-f75f-4a3b-b7f8-278b1bd6fc2a',
    resourceName: 'dev-rpa',
    lang: 'En'
  },
  sqlServer: {
    server: 'swMhnDevAppsSQL',
    database: 'FlightApps_vNext_RPA',
    username: 'MahanAppsServiceAccount',
    password: 'a45V6DPQZAHUpXz'
  },
  secretKey: 'Some random generated secret key!'
};

module.exports = { default: config };
