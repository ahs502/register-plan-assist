# Register Plan Assist

## Build and run

### Development

To prepare the project for development, after _clone_:

    $ npm install

To run both the server and the client and watch (restart) them for changes _(Also open browser on client port)_:

    $ npm start

The default server port is **3000** and the default client port is **4000** but you can specify any of them by setting the environment variables **SERVER_PORT** and **CLIENT_PORT** accordingly. For example:

    $ SERVER_PORT=3000 CLIENT_PORT=4000 npm start

> The node environment will be **development** in this approach.

#### Upgrade Dependencies

To check available updates for all dependencies:

    $ npm run check-updates

To check and install available updates for all dependencies:

    $ npm run install-updates

### Build

To build into `./dist` folder, after _clone_:

    $ npm run build

### Production / Test

To setup the project on the `./dist` folder, after _build_:

    dist$ npm install

then, to run it:

    dist$ npm start

The default port is **3000** and the default node environment is **production** but you can specify them by setting the environment variables **PORT** and **NODE_ENV** accordingly. For example:

    dist$ PORT=3000 NODE_ENV=production npm start

> The node environment can be either **production**, **test** or **development**.

## Public files

Place any file you want to serve statically into either `./Server/public` or `./Client/public` folders.

> There is no watch on the files within the `./Server/public` or `./Client/public` folders during development. So, when modifying their contents, you need to restart the development process manually.
