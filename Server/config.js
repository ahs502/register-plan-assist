var config = {
  env: 'development',
  oauth: {
    serverUrl: 'https://login.mahan.aero/adfs/oauth2/token',
    serverIssuer: 'https://login.mahan.aero/adfs/oauth2/authorize',
    clientUrl: 'http://localhost:4000/',
    clientId: 'b3ca0b10-f75f-4a3b-b7f8-278b1bd6fc2a',
    resourceName: 'dev-rpa',
    lang: 'En'
  },
  sqlServer: {
    server: 'swmhndevappssql',
    database: 'FlightApps_vNext_RPA',
    username: 'MahanAppsServiceAccount',
    password: 'a45V6DPQZAHUpXz'
  },
  secretKey: 'fsdjkla glsdfa kjglkjasfd ghasfdghasl;k ;lskg kjlahgfuiow rhtfurhgha g jkfangwreh gn89498 y353087 59w8 3570987Y*& ^%)&^#&^T&)*$@&Y)(*&@#Y $(@Y%()$YRURHfguisyreg ehrj'
};

module.exports = { default: config };
