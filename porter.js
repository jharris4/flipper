const path = require('path');
const npmPackage = require('./package');

const productName = "flipper";
const productVersion = npmPackage.version;
const outputPath = "dist/" + productName;
const publicPath = "/static/" + productName + "/";
const bundleName = `${productName}-${productVersion}-[name]`;

module.exports = {
  babel: {
    targets: [
      // "chrome 62",
      // "safari 10"
      "> 4%",
      "ie 11",
      "safari 8"
    ],
    options: {
      decorators: false,
      classProperties: true,
      objectRestSpread: true,
      reactJsx: true,
      forOfAsArray: false,
      reactRemovePropTypes: true,
      transformImportsMap: {},
      rewire: false
    }
  },
  webpack: {
    srcPaths: [
      'src'
    ],
    css: true,
    sass: false,
    html: {
      indexFilename: "../index.html",
      templatePath: "templates/index.html"
    },
    polyfills: {
      babel: true,
      fetch: true,
      eventSource: true // false
    },
    entry: {
      name: "main",
      files: [
        "./src/index.js"
      ]
    },
    split: {
      minChunks: 1,
      minSize: 500,
      maxAsyncRequests: 15,
      maxInitialRequests: 3
    },
    vendor: {
      name: "vendors",
      minChunks: 1,
      minSize: 500,
      resourceFilter: /node_modules/
    },
    splitVendor: false,
    outputPath: outputPath,
    publicPath: publicPath,
    bundleName: bundleName,
    babelCacheDirectory: true,
    resolveBabelCacheDirectory: true,
    globalPackageMap: {},
    defineMap: {
      PUBLIC_PATH: JSON.stringify(publicPath)
    },
    deployAssetMap: {
      "data": "data/"
    },
    deployPackageAssetMap: {},
    deployPackagePath: "node_modules",
    localPackageAssetMap: {},
    minify: true,
    hotModuleReplacement: true,
    reactHotLoader: false,
    reportFilename: "../../bundle-analyzer/report.html",
    sentry: false,
    sentryUpload: false
  },
  express: {
    productName: productName,
    host: "localhost",
    port: "1234",
    secure: false,
    openBrowser: false,
    compress: true,
    serviceWorkerPath: false,
    proxy: false,
    templateObject: {
      config: {
        routerBasePath: '/'
      }
    }
  },
  localConfigFile: "porter-local.js"
};