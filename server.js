const startExpressServer = require('@porterjs/express').startExpressServer;

const expressConfig = {
  productName: 'Flipper Native Server',
  host: 'localhost',
  port: 1234, // this really should be read from porter.js
  staticMap: {
    "/static/flipper/data": "data/"
  }
}

const basePath = process.cwd();
const mode = 'development';

const onStart = () => { };

startExpressServer({ expressConfig, basePath, mode, onStart });