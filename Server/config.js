var config = {
  env: 'development',
  oauth: {
    issuer: 'https://accounts.mahan.aero',
    api: 'https://ffp.mahan.aero',
    clientId: '2bb9d5f1-4101-4d28-afa9-47f475b7a0cc',
    resourceName: 'prod-ffp',
    lang: 'En'
  },
  sqlServer: {
    server: 'swmhndevappssql',
    database: 'FlightApps_dev',
    username: 'MahanAppsServiceAccount',
    password: 'a45V6DPQZAHUpXz'
  }
};

/* ENVIRONMENT SPECIFIC CONFIGURATION PLACEHOLDER */

module.exports = { default: config };
