const proxyMiddleware = require('http-proxy-middleware');

module.exports = function(app) {
  var proxyPort = process.env.PROXY_PORT;

  if (proxyPort) {
    app.use(proxyMiddleware('/*', { target: `http://localhost:${proxyPort}/` }));
  }
};
