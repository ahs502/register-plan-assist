const path = require('path');
const { override, removeModuleScopePlugin, babelInclude, addWebpackAlias, addBabelPlugin } = require('customize-cra');

module.exports = {
  webpack: override(
    removeModuleScopePlugin(),
    babelInclude([path.resolve('src'), path.resolve('../Core')]),
    addWebpackAlias({ src: path.resolve('./src'), '@core': path.resolve('../Core') }),
    addBabelPlugin('@babel/plugin-transform-modules-commonjs')
  ),
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      //TODO: See if you can implement proxy here instead of src/setupProxy.js file.
      return config;
    };
  }
};
