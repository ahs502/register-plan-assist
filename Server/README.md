# Register Plan Assist - Server

## Build and run

### Development

To prepare the project for development, after _clone_:

    $ npm install

To run the server once:

    $ npm run start-once

To run the server and watch (restart) for changes:

    $ npm start

The default port is **3000** but you can specify it by setting the environment variable **PORT**. For example:

    $ PORT=3000 npm start

> The node environment will be **`development`** in this approach.

### Build

To build into `./dist` folder, after _clone_:

    $ npm install
    $ npm run build

### Production / Test

To setup the server on the `./dist` folder, after _build_:

    dist$ npm install

and, to make the `./config.js` file:

    dist$ npm run config

> The above uses the following environment variables to fill in the configuration file: `'ENV'`, `'OAUTH_SERVER_URL'`, `'OAUTH_SERVER_ISSUER'`, `'OAUTH_CLIENT_URL'`, `'OAUTH_CLIENT_ID'`, `'OAUTH_RESOURCE_NAME'`, `'OAUTH_LANG'`, `'SQL_SERVER_SERVER'`, `'SQL_SERVER_DATABASE'`, `'SQL_SERVER_USERNAME'` and `'SQL_SERVER_PASSWORD'`.

> Each build artiface can only be configured **once**. Make sure to create proper backups before running `npm run config`.

then, to run it:

    dist$ npm start

The default port is **3000** and the default node environment is **production** but you can specify them by setting the environment variables **PORT** and **NODE_ENV** accordingly. For example:

    dist$ PORT=3000 NODE_ENV=production npm start

> The node environment can be either **`production`**, **`user acceptance test`**, **`quality assurance`** or **`development`**.

## Public files

Place any file you want to serve statically into the `./public` folder.

> There is no watch on the files within the `./public` folder during development. So, when modifying its content, you need to restart the server manually.
