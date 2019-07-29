var config = {
  env: 'development',
  oauth: {
    issuer: 'https://login.mahan.aero/adfs/oauth2/authorize',
    api: 'http://localhost:4200',
    clientId: 'b3ca0b10-f75f-4a3b-b7f8-278b1bd6fc2a',
    resourceName: 'dev-rpa',
    lang: 'En'
  },
  sqlServer: {
    server: 'swmhndevappssql',
    database: 'FlightApps_vNext_RPA',
    username: 'MahanAppsServiceAccount',
    password: 'a45V6DPQZAHUpXz'
  }
};

/* ENVIRONMENT SPECIFIC CONFIGURATION PLACEHOLDER */

module.exports = { default: config };
