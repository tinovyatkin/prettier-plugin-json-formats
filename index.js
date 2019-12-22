const {join} = require('path');

require('ts-node').register({
  project: join(__dirname, 'tsconfig.json'),
});

module.exports = require('./src/index.ts');
